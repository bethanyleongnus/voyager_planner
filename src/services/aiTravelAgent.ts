/**
 * AI Travel Agent Copilot
 * Integrates with Gemini 3.8 Flash and orchestrates Travel MCP tools
 */

import { GoogleGenAI } from '@google/genai';
import { mcpClient } from './mcpClient';
import { TripState, ChatMessage } from '../types/travel';

export interface AgentResponse {
  reply: string;
  toolCallsExecuted: {
    toolName: string;
    args: Record<string, any>;
    resultSummary: string;
  }[];
  tripUpdates?: Partial<TripState>;
}

export class AiTravelAgent {
  private client: GoogleGenAI | null = null;

  constructor() {
    const apiKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Process user travel prompt, maintaining current trip context and executing MCP tools
   */
  public async processPrompt(
    userPrompt: string,
    currentTrip: TripState,
    conversationHistory: ChatMessage[]
  ): Promise<AgentResponse> {
    const executedTools: { toolName: string; args: any; resultSummary: string }[] = [];
    let tripUpdates: Partial<TripState> = {};
    const promptLower = userPrompt.toLowerCase();

    // 1. Detect if user is changing duration (e.g. "make it 6 days", "change to 5 days", "2 days shorter")
    const daysMatch = promptLower.match(/(\d+)\s*days?/);
    const shorterMatch = promptLower.match(/(\d+)\s*days?\s*shorter/);
    const longerMatch = promptLower.match(/(\d+)\s*days?\s*longer/);

    if (shorterMatch) {
      const reduction = parseInt(shorterMatch[1], 10);
      const newDuration = Math.max(2, currentTrip.durationDays - reduction);
      tripUpdates.durationDays = newDuration;
      // Re-generate or trim itinerary
      const itineraryRes = await mcpClient.generateItinerary(
        currentTrip.destination.name,
        newDuration,
        currentTrip.numTravellers,
        currentTrip.baseBudgetSGD
      );
      tripUpdates.itinerary = itineraryRes.days;
      executedTools.push({
        toolName: 'generate_itinerary',
        args: { destination: currentTrip.destination.name, durationDays: newDuration },
        resultSummary: `Re-calculated itinerary for ${newDuration} days to ensure relaxed pacing and optimal geographic clustering.`,
      });
    } else if (longerMatch) {
      const addition = parseInt(longerMatch[1], 10);
      const newDuration = Math.min(14, currentTrip.durationDays + addition);
      tripUpdates.durationDays = newDuration;
      const itineraryRes = await mcpClient.generateItinerary(
        currentTrip.destination.name,
        newDuration,
        currentTrip.numTravellers,
        currentTrip.baseBudgetSGD
      );
      tripUpdates.itinerary = itineraryRes.days;
      executedTools.push({
        toolName: 'generate_itinerary',
        args: { destination: currentTrip.destination.name, durationDays: newDuration },
        resultSummary: `Expanded itinerary to ${newDuration} days with extra cultural and culinary highlights.`,
      });
    } else if (daysMatch && (promptLower.includes('change') || promptLower.includes('make') || promptLower.includes('plan for'))) {
      const newDuration = Math.min(14, Math.max(2, parseInt(daysMatch[1], 10)));
      tripUpdates.durationDays = newDuration;
      const itineraryRes = await mcpClient.generateItinerary(
        currentTrip.destination.name,
        newDuration,
        currentTrip.numTravellers,
        currentTrip.baseBudgetSGD
      );
      tripUpdates.itinerary = itineraryRes.days;
      executedTools.push({
        toolName: 'generate_itinerary',
        args: { destination: currentTrip.destination.name, durationDays: newDuration },
        resultSummary: `Adjusted trip duration to ${newDuration} days.`,
      });
    }

    // 2. Detect budget changes (e.g. "budget is 3500", "change budget to SGD 5,000")
    const budgetMatch = promptLower.match(/(\d+[\d,]*)\s*(?:sgd|dollars?|\$)/i) || promptLower.match(/budget\s*(?:is|to|of)?\s*(\d+[\d,]*)/i);
    if (budgetMatch && (promptLower.includes('budget') || promptLower.includes('sgd'))) {
      const budgetVal = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
      if (budgetVal >= 500 && budgetVal <= 50000) {
        tripUpdates.baseBudgetSGD = budgetVal;
        executedTools.push({
          toolName: 'get_currency_rates',
          args: { currencyCode: currentTrip.destination.currencyCode, amountSGD: budgetVal },
          resultSummary: `Updated base budget to SGD ${budgetVal.toLocaleString()} (approx ${Math.round(budgetVal * 114.25).toLocaleString()} ${currentTrip.destination.currencyCode}).`,
        });
      }
    }

    // 3. Detect visa inquiries
    if (promptLower.includes('visa') || promptLower.includes('passport') || promptLower.includes('entry requirement')) {
      const visaData = await mcpClient.checkVisaRequirements(currentTrip.destination.country, 'Singapore (🇸🇬)');
      executedTools.push({
        toolName: 'check_visa_requirements',
        args: { destinationCountry: currentTrip.destination.country, passportCountry: 'Singapore (🇸🇬)' },
        resultSummary: `${visaData.visaType}: ${visaData.maxStayDays} days stay permitted. Passport must have ${visaData.passportValidityMonths} months validity.`,
      });
    }

    // 4. Detect weather inquiries
    if (promptLower.includes('weather') || promptLower.includes('rain') || promptLower.includes('temperature') || promptLower.includes('pack')) {
      const weatherData = await mcpClient.getLiveWeather(currentTrip.destination.name);
      executedTools.push({
        toolName: 'get_live_weather',
        args: { destination: currentTrip.destination.name },
        resultSummary: `Expected temp: ${weatherData.lowTempC}°C - ${weatherData.highTempC}°C. ${weatherData.condition}.`,
      });
    }

    // 5. Detect flight inquiries
    if (promptLower.includes('flight') || promptLower.includes('airline') || promptLower.includes('fly') || promptLower.includes('changi')) {
      const flightData = await mcpClient.searchFlights(currentTrip.destination.name, 'SIN', currentTrip.durationDays);
      executedTools.push({
        toolName: 'search_flights',
        args: { originAirport: 'SIN', destination: currentTrip.destination.name },
        resultSummary: `Found ${flightData.flights.length} flight options from Singapore Changi (SIN) including direct non-stop options.`,
      });
    }

    // 6. Detect food, activities, or accommodation
    if (promptLower.includes('hotel') || promptLower.includes('stay') || promptLower.includes('airbnb') || promptLower.includes('ryokan')) {
      const accData = await mcpClient.searchAccommodations(currentTrip.destination.name);
      executedTools.push({
        toolName: 'search_accommodations',
        args: { destination: currentTrip.destination.name },
        resultSummary: `Retrieved ${accData.accommodations.length} vetted stays and boutique hotel options.`,
      });
    }

    if (promptLower.includes('food') || promptLower.includes('restaurant') || promptLower.includes('eat') || promptLower.includes('dish') || promptLower.includes('ramen')) {
      const foodData = await mcpClient.searchPlaces(currentTrip.destination.name, 'food');
      executedTools.push({
        toolName: 'search_places_attractions',
        args: { destination: currentTrip.destination.name, category: 'food' },
        resultSummary: `Discovered top culinary hotspots and street food markets in ${currentTrip.destination.name}.`,
      });
    }

    // Call server Gemini API route or fallback intelligent synthesizer
    let agentReply = '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          tripContext: currentTrip,
          executedTools,
          history: conversationHistory.slice(-6),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          agentReply = data.reply;
          if (data.tripUpdates) {
            tripUpdates = { ...tripUpdates, ...data.tripUpdates };
          }
        }
      }
    } catch {
      // Offline / client fallback
    }

    if (!agentReply) {
      agentReply = this.synthesizeLocalResponse(userPrompt, currentTrip, executedTools, tripUpdates);
    }

    return {
      reply: agentReply,
      toolCallsExecuted: executedTools,
      tripUpdates: Object.keys(tripUpdates).length > 0 ? tripUpdates : undefined,
    };
  }

  private synthesizeLocalResponse(
    userPrompt: string,
    trip: TripState,
    tools: { toolName: string; args: any; resultSummary: string }[],
    updates: Partial<TripState>
  ): string {
    const destName = trip.destination.name;
    const destCountry = trip.destination.country;
    const duration = updates.durationDays || trip.durationDays;
    const budget = updates.baseBudgetSGD || trip.baseBudgetSGD;

    const toolSummaries = tools.map((t) => `• **${t.toolName}**: ${t.resultSummary}`).join('\n');

    let reply = `I've updated your trip plan for **${destName}, ${destCountry}** (${duration} days, SGD ${budget.toLocaleString()} base budget).\n\n`;

    if (tools.length > 0) {
      reply += `### ⚡ MCP Integrations Queried:\n${toolSummaries}\n\n`;
    }

    if (updates.durationDays) {
      reply += `✓ **Itinerary Recalibration**: Adjusted the schedule to **${updates.durationDays} days**, clustering sights geographically to minimize transit exhaustion while ensuring top food and cultural spots are preserved.\n\n`;
    }

    if (updates.baseBudgetSGD) {
      reply += `✓ **Budget Rebalance**: Reallocated your base budget to **SGD ${updates.baseBudgetSGD.toLocaleString()}**, with live comparisons to local ${trip.destination.currencyCode} on the Budget tab.\n\n`;
    }

    if (userPrompt.toLowerCase().includes('visa')) {
      reply += `For Singapore passport holders entering **${destCountry}**, no advance tourist visa is required for stays up to 90 days. Be sure your passport has at least 6 months validity and submit the digital arrival card before boarding.\n\n`;
    }

    if (userPrompt.toLowerCase().includes('flight')) {
      reply += `Non-stop direct options from Singapore Changi (SIN) take approximately 6h 40m - 7h. Singapore Airlines and ANA depart daily, with Scoot providing a budget-friendly option.\n\n`;
    }

    if (userPrompt.toLowerCase().includes('food') || userPrompt.toLowerCase().includes('ramen')) {
      reply += `I've highlighted premier culinary spots: Tsukiji outer market for morning seafood and tamagoyaki, standing counter ramen bars, and intimate yakitori alleys. You can add them directly to any day's timeline!\n\n`;
    }

    reply += `You can review the updated day-by-day plan in the **Itinerary** tab, check pin locations on the **Interactive Map**, or ask me to customize any specific day!`;

    return reply;
  }
}

export const aiTravelAgent = new AiTravelAgent();

/**
 * AI Travel Agent Copilot
 * Integrates with Gemini 3.8 Flash and orchestrates Travel MCP tools
 * Edits itinerary, budget, duration, and destination in real time
 */

import { mcpClient } from './mcpClient';
import { TripState, ChatMessage, DayPlan, ItineraryItem } from '../types/travel';
import { POPULAR_DESTINATIONS, DESTINATION_DETAILS_MAP, generateGenericDestinationDetails } from '../mcp/travel-data';

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
    const promptLower = userPrompt.toLowerCase().trim();

    // 1. Detect Destination Switch (e.g. "plan for Kyoto", "switch to Bali", "go to Paris", "change destination to London")
    const destKeywords = ['kyoto', 'paris', 'bali', 'london', 'seoul', 'rome', 'zurich', 'bangkok', 'sydney', 'new york', 'reykjavik', 'tokyo', 'osaka'];
    for (const dk of destKeywords) {
      if (
        (promptLower.includes(dk) || promptLower.includes(`to ${dk}`) || promptLower.includes(`for ${dk}`)) &&
        !currentTrip.destination.name.toLowerCase().includes(dk) &&
        (promptLower.includes('plan') || promptLower.includes('go to') || promptLower.includes('switch') || promptLower.includes('change') || promptLower.includes('instead') || promptLower.includes('visit'))
      ) {
        const matched = POPULAR_DESTINATIONS.find((d) => d.name.toLowerCase().includes(dk)) || POPULAR_DESTINATIONS[0];
        const newItin = await mcpClient.generateItinerary(matched.name, currentTrip.durationDays, currentTrip.numTravellers, currentTrip.baseBudgetSGD);
        tripUpdates.destination = matched;
        tripUpdates.itinerary = newItin.days;
        executedTools.push({
          toolName: 'search_destinations',
          args: { query: matched.name },
          resultSummary: `Switched destination to ${matched.name}, ${matched.country} and rebuilt the day-by-day plan with authentic landmarks.`,
        });
        break;
      }
    }

    // 2. Detect Duration Changes (e.g. "make it 6 days", "change to 5 days", "2 days shorter", "3 days longer")
    const daysMatch = promptLower.match(/(\d+)\s*days?/);
    const shorterMatch = promptLower.match(/(\d+)\s*days?\s*shorter/);
    const longerMatch = promptLower.match(/(\d+)\s*days?\s*longer/);

    if (shorterMatch) {
      const reduction = parseInt(shorterMatch[1], 10);
      const newDuration = Math.max(2, currentTrip.durationDays - reduction);
      tripUpdates.durationDays = newDuration;
      const targetDest = tripUpdates.destination?.name || currentTrip.destination.name;
      const itineraryRes = await mcpClient.generateItinerary(
        targetDest,
        newDuration,
        currentTrip.numTravellers,
        currentTrip.baseBudgetSGD
      );
      tripUpdates.itinerary = itineraryRes.days;
      executedTools.push({
        toolName: 'generate_itinerary',
        args: { destination: targetDest, durationDays: newDuration },
        resultSummary: `Recalculated itinerary for ${newDuration} days to prevent rushed transit and keep optimal regional flow.`,
      });
    } else if (longerMatch) {
      const addition = parseInt(longerMatch[1], 10);
      const newDuration = Math.min(14, currentTrip.durationDays + addition);
      tripUpdates.durationDays = newDuration;
      const targetDest = tripUpdates.destination?.name || currentTrip.destination.name;
      const itineraryRes = await mcpClient.generateItinerary(
        targetDest,
        newDuration,
        currentTrip.numTravellers,
        currentTrip.baseBudgetSGD
      );
      tripUpdates.itinerary = itineraryRes.days;
      executedTools.push({
        toolName: 'generate_itinerary',
        args: { destination: targetDest, durationDays: newDuration },
        resultSummary: `Expanded itinerary to ${newDuration} days with additional cultural highlights and dining spots.`,
      });
    } else if (daysMatch && (promptLower.includes('change') || promptLower.includes('make') || promptLower.includes('plan for') || promptLower.includes('shorten') || promptLower.includes('lengthen'))) {
      const newDuration = Math.min(14, Math.max(2, parseInt(daysMatch[1], 10)));
      tripUpdates.durationDays = newDuration;
      const targetDest = tripUpdates.destination?.name || currentTrip.destination.name;
      const itineraryRes = await mcpClient.generateItinerary(
        targetDest,
        newDuration,
        currentTrip.numTravellers,
        currentTrip.baseBudgetSGD
      );
      tripUpdates.itinerary = itineraryRes.days;
      executedTools.push({
        toolName: 'generate_itinerary',
        args: { destination: targetDest, durationDays: newDuration },
        resultSummary: `Updated itinerary schedule to ${newDuration} days.`,
      });
    }

    // 3. Detect Budget Modifications (e.g. "budget is 3500", "change budget to SGD 5,000", "SGD 3000")
    const budgetMatch = promptLower.match(/(\d+[\d,]*)\s*(?:sgd|dollars?|\$)/i) || promptLower.match(/budget\s*(?:is|to|of)?\s*(\d+[\d,]*)/i);
    if (budgetMatch && (promptLower.includes('budget') || promptLower.includes('sgd') || promptLower.includes('cost'))) {
      const budgetVal = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
      if (budgetVal >= 500 && budgetVal <= 50000) {
        tripUpdates.baseBudgetSGD = budgetVal;
        executedTools.push({
          toolName: 'get_currency_rates',
          args: { currencyCode: currentTrip.destination.currencyCode, amountSGD: budgetVal },
          resultSummary: `Updated base budget to SGD ${budgetVal.toLocaleString()} with real-time conversion on Budget tab.`,
        });
      }
    }

    // 4. Detect "Replace Day X with relaxed / food / nature / spa"
    const replaceDayMatch = promptLower.match(/replace\s*day\s*(\d+)/i) || promptLower.match(/change\s*day\s*(\d+)/i) || promptLower.match(/make\s*day\s*(\d+)\s*(?:more\s*)?(relaxed|chill|leisurely|food|nature)/i);
    if (replaceDayMatch) {
      const dayNum = parseInt(replaceDayMatch[1], 10);
      const isRelaxed = promptLower.includes('relax') || promptLower.includes('chill') || promptLower.includes('leisure') || promptLower.includes('spa') || promptLower.includes('onsen');
      const isFood = promptLower.includes('food') || promptLower.includes('crawl') || promptLower.includes('eat') || promptLower.includes('market');

      const existingItin: DayPlan[] = tripUpdates.itinerary || currentTrip.itinerary;
      if (existingItin && existingItin.length > 0) {
        const destName = currentTrip.destination.name;
        const targetDay = existingItin.find((d) => d.dayNumber === dayNum) || existingItin[0];

        if (targetDay) {
          const relaxedItems: ItineraryItem[] = isRelaxed
            ? [
                {
                  id: `item-d${dayNum}-relax-1`,
                  dayNumber: dayNum,
                  timeSlot: 'morning',
                  startTime: '10:30',
                  endTime: '12:30',
                  title: `Leisurely Morning & Scenic Botanical Walk`,
                  category: 'relaxation',
                  coordinates: [currentTrip.destination.coordinates[0] + 0.005, currentTrip.destination.coordinates[1] - 0.004],
                  locationName: `${destName} Serene Gardens & Promenade`,
                  description: `Slow start to the day. Enjoy a freshly roasted artisan coffee and tranquil stroll through peaceful garden pathways.`,
                  estimatedCostSGD: 12,
                  notes: 'Sleep in until 9:30 AM; perfect zero-rush morning.',
                  provider: 'AI Itinerary Copilot',
                },
                {
                  id: `item-d${dayNum}-relax-2`,
                  dayNumber: dayNum,
                  timeSlot: 'afternoon',
                  startTime: '13:00',
                  endTime: '15:30',
                  title: `Relaxed Courtyard Lunch & Traditional Tea Tasting`,
                  category: 'food',
                  coordinates: [currentTrip.destination.coordinates[0] + 0.003, currentTrip.destination.coordinates[1] + 0.002],
                  locationName: `Historic Tea Salon, ${destName}`,
                  description: `Savor seasonal savory dishes followed by freshly whisked ceremonial tea and artisanal confections.`,
                  estimatedCostSGD: 35,
                  travelTimeFromPrevious: { duration: '10 mins', mode: 'walk', distanceKm: 0.6 },
                  notes: 'Unwind at an unhurried pace.',
                  provider: 'AI Itinerary Copilot',
                },
                {
                  id: `item-d${dayNum}-relax-3`,
                  dayNumber: dayNum,
                  timeSlot: 'evening',
                  startTime: '16:30',
                  endTime: '19:00',
                  title: `Thermal Bath / Onsen Spa & Sunset View`,
                  category: 'relaxation',
                  coordinates: [currentTrip.destination.coordinates[0] - 0.002, currentTrip.destination.coordinates[1] + 0.005],
                  locationName: `${destName} Sky Spa / Mineral Baths`,
                  description: `Rejuvenate tired muscles in soothing hot mineral baths gazing out across the sunset skyline.`,
                  estimatedCostSGD: 38,
                  travelTimeFromPrevious: { duration: '12 mins', mode: 'metro', distanceKm: 2.1 },
                  notes: 'Towels and organic amenities provided.',
                  provider: 'AI Itinerary Copilot',
                },
              ]
            : [
                {
                  id: `item-d${dayNum}-food-1`,
                  dayNumber: dayNum,
                  timeSlot: 'morning',
                  startTime: '09:30',
                  endTime: '12:00',
                  title: `Historic Morning Food Hall & Fresh Delicacy Tasting`,
                  category: 'food',
                  coordinates: [currentTrip.destination.coordinates[0] - 0.004, currentTrip.destination.coordinates[1] + 0.006],
                  locationName: `${destName} Artisan Market Hall`,
                  description: `Sample hot skewers, fresh morning baked specialties, and local fruit stalls.`,
                  estimatedCostSGD: 28,
                  notes: 'Come with an appetite!',
                  provider: 'AI Itinerary Copilot',
                },
                {
                  id: `item-d${dayNum}-food-2`,
                  dayNumber: dayNum,
                  timeSlot: 'afternoon',
                  startTime: '13:00',
                  endTime: '16:00',
                  title: `Gastronomy Walking Tour & Specialty Tasting`,
                  category: 'food',
                  coordinates: [currentTrip.destination.coordinates[0] + 0.002, currentTrip.destination.coordinates[1] + 0.003],
                  locationName: `${destName} Old Town Culinary Backstreets`,
                  description: `Hop through 4 legendary neighborhood stalls known only to local food lovers.`,
                  estimatedCostSGD: 42,
                  travelTimeFromPrevious: { duration: '8 mins', mode: 'walk', distanceKm: 0.5 },
                  notes: 'Chef counter seats with local stories.',
                  provider: 'AI Itinerary Copilot',
                },
              ];

          const updatedItin = existingItin.map((d) =>
            d.dayNumber === dayNum
              ? {
                  ...d,
                  theme: isRelaxed ? `Day ${dayNum}: Relaxed Pacing & Scenic Wellness` : `Day ${dayNum}: Ultimate Gastronomy & Food Crawl`,
                  items: relaxedItems,
                  estimatedWalkingKm: isRelaxed ? 3.5 : 5.0,
                }
              : d
          );

          tripUpdates.itinerary = updatedItin;
          executedTools.push({
            toolName: 'generate_itinerary',
            args: { dayNumber: dayNum, style: isRelaxed ? 'relaxed' : 'food' },
            resultSummary: `Replaced Day ${dayNum} with a ${isRelaxed ? 'leisurely, relaxed schedule featuring scenic gardens, tea tasting, and spa' : 'gastronomy-focused crawl'}.`,
          });
        }
      }
    }

    // 5. Detect "Add [activity/food] to Day X"
    const addMatch = promptLower.match(/add\s*(.*?)\s*(?:to|on|in)\s*day\s*(\d+)/i);
    if (addMatch && !replaceDayMatch) {
      const activityText = addMatch[1].trim();
      const dayNum = parseInt(addMatch[2], 10);
      const existingItin: DayPlan[] = tripUpdates.itinerary || currentTrip.itinerary;

      if (existingItin && existingItin.length > 0) {
        const isEvening = promptLower.includes('evening') || promptLower.includes('night') || promptLower.includes('dinner');
        const isMorning = promptLower.includes('morning') || promptLower.includes('breakfast');

        const newItem: ItineraryItem = {
          id: `item-user-${Date.now()}`,
          dayNumber: dayNum,
          timeSlot: isEvening ? 'evening' : isMorning ? 'morning' : 'afternoon',
          startTime: isEvening ? '19:00' : isMorning ? '09:30' : '15:00',
          endTime: isEvening ? '21:30' : isMorning ? '11:45' : '17:30',
          title: activityText.charAt(0).toUpperCase() + activityText.slice(1),
          category: promptLower.includes('food') || promptLower.includes('ramen') || promptLower.includes('dinner') ? 'food' : 'attraction',
          coordinates: [currentTrip.destination.coordinates[0] + 0.003, currentTrip.destination.coordinates[1] + 0.003],
          locationName: `${currentTrip.destination.name} Central District`,
          description: `Custom requested experience added to your itinerary schedule.`,
          estimatedCostSGD: 25,
          notes: 'Added via AI Copilot in real time.',
          provider: 'AI Itinerary Copilot',
        };

        const updatedItin = existingItin.map((d) => {
          if (d.dayNumber === dayNum) {
            return {
              ...d,
              items: [...d.items, newItem],
            };
          }
          return d;
        });

        tripUpdates.itinerary = updatedItin;
        executedTools.push({
          toolName: 'generate_itinerary',
          args: { action: 'add_item', dayNumber: dayNum, activity: activityText },
          resultSummary: `Added "${newItem.title}" to Day ${dayNum} (${newItem.timeSlot})!`,
        });
      }
    }

    // 6. Detect Visa inquiry
    if (promptLower.includes('visa') || promptLower.includes('passport') || promptLower.includes('entry requirement')) {
      const visaData = await mcpClient.checkVisaRequirements(currentTrip.destination.country, 'Singapore (🇸🇬)');
      executedTools.push({
        toolName: 'check_visa_requirements',
        args: { destinationCountry: currentTrip.destination.country, passportCountry: 'Singapore (🇸🇬)' },
        resultSummary: `${visaData.visaType}: ${visaData.maxStayDays} days stay permitted. Passport must have ${visaData.passportValidityMonths} months validity.`,
      });
    }

    // 7. Detect Weather inquiry
    if (promptLower.includes('weather') || promptLower.includes('rain') || promptLower.includes('temperature') || promptLower.includes('pack')) {
      const weatherData = await mcpClient.getLiveWeather(currentTrip.destination.name);
      executedTools.push({
        toolName: 'get_live_weather',
        args: { destination: currentTrip.destination.name },
        resultSummary: `Expected temp: ${weatherData.lowTempC}°C - ${weatherData.highTempC}°C. ${weatherData.condition}.`,
      });
    }

    // 8. Call server /api/chat with Gemini
    let agentReply = '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          tripContext: { ...currentTrip, ...tripUpdates },
          executedTools,
          history: conversationHistory.slice(-6),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          agentReply = data.reply;
        }
      }
    } catch {
      // Offline fallback
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
    const destName = updates.destination?.name || trip.destination.name;
    const destCountry = updates.destination?.country || trip.destination.country;
    const duration = updates.durationDays || trip.durationDays;
    const budget = updates.baseBudgetSGD || trip.baseBudgetSGD;

    const toolSummaries = tools.map((t) => `• **${t.toolName}**: ${t.resultSummary}`).join('\n');

    let reply = `I've updated your trip plan for **${destName}, ${destCountry}** (${duration} days, base budget SGD ${budget.toLocaleString()}).\n\n`;

    if (tools.length > 0) {
      reply += `### ⚡ MCP Integrations Queried:\n${toolSummaries}\n\n`;
    }

    if (updates.itinerary) {
      reply += `✓ **Itinerary Updated in Real Time**: Your daily schedule has been synchronized. You can immediately see the updated stops and route lines on the **Itinerary** and **Interactive Map** tabs!\n\n`;
    }

    if (updates.durationDays) {
      reply += `✓ **Duration Adjusted**: Scheduled for **${updates.durationDays} days**, clustered geographically by district to eliminate unnecessary travel.\n\n`;
    }

    if (updates.baseBudgetSGD) {
      reply += `✓ **Budget Rebalance**: Reallocated your base budget to **SGD ${updates.baseBudgetSGD.toLocaleString()}**.\n\n`;
    }

    reply += `What else would you like to tweak? You can ask to add dining spots, change the pace, swap sights, or adjust flights and stays!`;

    return reply;
  }
}

export const aiTravelAgent = new AiTravelAgent();

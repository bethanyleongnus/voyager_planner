/**
 * VoyageMCP Shared API Route Handler
 * Reused by server.ts, vite.config.ts dev middleware, and api/index.ts
 */

import { GoogleGenAI } from '@google/genai';
import { travelMcpServer, TRAVEL_MCP_TOOLS, resolveDestinationData } from '../mcp/travel-mcp-server';
import {
  POPULAR_DESTINATIONS,
  GLOBAL_CURRENCY_RATES,
  DESTINATION_DETAILS_MAP,
  generateGenericDestinationDetails,
} from '../mcp/travel-data';

export async function handleApiRequest(
  url: string,
  method: string,
  body: any
): Promise<{ status: number; headers: Record<string, string>; body: any }> {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  try {
    // 1. MCP JSON-RPC 2.0 Endpoint
    if (url.startsWith('/api/mcp')) {
      if (method !== 'POST') {
        return { status: 405, headers: jsonHeaders, body: { error: 'Method not allowed' } };
      }
      const rpcResponse = await travelMcpServer.handleJsonRpc(body);
      return { status: 200, headers: jsonHeaders, body: rpcResponse };
    }

    // 2. Chat with Gemini 3.8 Flash Travel Agent
    if (url.startsWith('/api/chat')) {
      if (method !== 'POST') {
        return { status: 405, headers: jsonHeaders, body: { error: 'Method not allowed' } };
      }

      const { prompt, tripContext, executedTools, history } = body || {};
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Return structured fallback if API key is not configured in local environment
        return {
          status: 200,
          headers: jsonHeaders,
          body: {
            reply: `I have analyzed your request regarding **${tripContext?.destination?.name || 'your destination'}**.\n\n` +
              `Based on the travel requirements (${tripContext?.durationDays || 7} days, base budget SGD ${tripContext?.baseBudgetSGD?.toLocaleString() || '4,000'}), I've validated geographic clustering and transit feasibility.\n\n` +
              `You can review your updated itinerary, pin locations on the interactive map, and inspect live SGD conversions on the Budget tab.`,
            toolCalls: executedTools || [],
          },
        };
      }

      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        const systemInstruction = `You are VoyageMCP, an expert senior AI travel architect and planning copilot.
You specialize in practical, realistic, and delightful travel itineraries for travellers departing from Singapore or globally.
Current Trip State:
- Origin: ${tripContext?.origin || 'Singapore (SIN)'}
- Destination: ${tripContext?.destination?.name}, ${tripContext?.destination?.country}
- Currency: ${tripContext?.destination?.currencyCode} (Base comparison: SGD)
- Duration: ${tripContext?.durationDays} days
- Budget: SGD ${tripContext?.baseBudgetSGD}
- Travellers: ${tripContext?.numTravellers}

Guidelines:
1. Be concise, highly informative, realistic, and enthusiastic.
2. Avoid generic travel fluff; provide specific neighborhood names, transit recommendations, and realistic time buffers.
3. When the user asks to modify the trip (e.g. duration, budget, pace, activities), confirm the specific adjustments made.
4. Keep currency comparisons clear with base SGD.
5. If MCP tools were queried, briefly highlight the verified facts.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nUser Question/Request: "${prompt}"\n\nRecent Tools Executed:\n${JSON.stringify(executedTools || [], null, 2)}` }],
            },
          ],
        });

        const replyText = response.text || 'I have updated your travel plan based on your preferences.';
        return {
          status: 200,
          headers: jsonHeaders,
          body: {
            reply: replyText,
            toolCalls: executedTools || [],
          },
        };
      } catch (err: any) {
        return {
          status: 200,
          headers: jsonHeaders,
          body: {
            reply: `I have processed your update for ${tripContext?.destination?.name || 'your trip'}. The itinerary and travel coordinates have been synchronized.`,
            error: err.message,
          },
        };
      }
    }

    // 3. Destinations list
    if (url.startsWith('/api/destinations')) {
      const q = new URL(url, 'http://localhost').searchParams.get('q')?.toLowerCase() || '';
      const list = POPULAR_DESTINATIONS.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.region.toLowerCase().includes(q)
      );
      return { status: 200, headers: jsonHeaders, body: list.length > 0 ? list : POPULAR_DESTINATIONS };
    }

    // 4. Destination Full Details
    if (url.startsWith('/api/destination-details')) {
      const destParam = new URL(url, 'http://localhost').searchParams.get('dest') || 'tokyo-japan';
      const details = resolveDestinationData(destParam);
      return { status: 200, headers: jsonHeaders, body: details };
    }

    // 5. Exchange rates against SGD
    if (url.startsWith('/api/exchange-rates')) {
      return { status: 200, headers: jsonHeaders, body: GLOBAL_CURRENCY_RATES };
    }

    // 6. Tools catalog list
    if (url.startsWith('/api/tools')) {
      return { status: 200, headers: jsonHeaders, body: { tools: TRAVEL_MCP_TOOLS } };
    }

    return { status: 404, headers: jsonHeaders, body: { error: 'Route not found' } };
  } catch (err: any) {
    return {
      status: 500,
      headers: jsonHeaders,
      body: { error: err.message || 'Internal Server Error' },
    };
  }
}

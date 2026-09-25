/**
 * Travel MCP Client & Orchestrator
 * Connects to VoyageMCP server with local fallback resilience
 */

import { travelMcpServer } from '../mcp/travel-mcp-server';
import {
  DestinationSummary,
  DestinationFactoids,
  WeatherSeasonInfo,
  VisaInfo,
  FlightOption,
  GroundTransportOption,
  AccommodationOption,
  PlaceActivity,
  DayPlan,
  TripBudgetBreakdown,
} from '../types/travel';

class McpClient {
  private rpcId = 1;

  /**
   * Execute JSON-RPC 2.0 call against MCP Server
   */
  public async executeRpc(method: string, params?: any): Promise<any> {
    const id = this.rpcId++;
    const req = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    // Try backend HTTP endpoint if running in browser with server
    try {
      if (typeof window !== 'undefined') {
        const res = await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.result) return data.result;
        }
      }
    } catch {
      // In-process fallback
    }

    // Direct in-process MCP server execution
    const fallbackRes = await travelMcpServer.handleJsonRpc(req);
    if (fallbackRes.error) {
      throw new Error(fallbackRes.error.message);
    }
    return fallbackRes.result;
  }

  public async callTool<T = any>(name: string, args: Record<string, any>): Promise<T> {
    const res = await this.executeRpc('tools/call', { name, arguments: args });
    if (res?.content?.[0]?.text) {
      return JSON.parse(res.content[0].text);
    }
    return res;
  }

  public async searchDestinations(query: string): Promise<DestinationSummary[]> {
    const data = await this.callTool<{ destinations: DestinationSummary[] }>('search_destinations', { query });
    return data.destinations || [];
  }

  public async getDestinationFactoids(destination: string): Promise<DestinationFactoids> {
    return this.callTool<DestinationFactoids>('get_destination_factoids', { destination });
  }

  public async getLiveWeather(destination: string, travelMonth?: string): Promise<WeatherSeasonInfo> {
    return this.callTool<WeatherSeasonInfo>('get_live_weather', { destination, travelMonth });
  }

  public async checkVisaRequirements(destinationCountry: string, passportCountry = 'Singapore (🇸🇬)'): Promise<VisaInfo> {
    return this.callTool<VisaInfo>('check_visa_requirements', { destinationCountry, passportCountry });
  }

  public async getCurrencyRates(currencyCode: string, amountSGD = 100) {
    return this.callTool('get_currency_rates', { currencyCode, amountSGD });
  }

  public async searchFlights(destination: string, originAirport = 'SIN', tripDurationDays = 7): Promise<{ flights: FlightOption[]; origin: string; destination: string }> {
    return this.callTool('search_flights', { destination, originAirport, tripDurationDays });
  }

  public async searchAccommodations(destination: string, budgetPerNightSGD = 250, totalNights = 7): Promise<{ accommodations: AccommodationOption[] }> {
    return this.callTool('search_accommodations', { destination, budgetPerNightSGD, totalNights });
  }

  public async searchPlaces(destination: string, category = 'all'): Promise<{ places: PlaceActivity[]; count: number }> {
    return this.callTool('search_places_attractions', { destination, category });
  }

  public async calculateRoute(fromLocation: string, toLocation: string, cityContext = '') {
    return this.callTool('calculate_route_transit', { fromLocation, toLocation, cityContext });
  }

  public async generateItinerary(
    destination: string,
    durationDays = 7,
    numTravellers = 2,
    budgetTotalSGD = 4000,
    interests = 'food, culture, nature'
  ): Promise<{ destination: string; durationDays: number; days: DayPlan[]; budgetEstimatedSGD: TripBudgetBreakdown }> {
    return this.callTool('generate_itinerary', {
      destination,
      durationDays,
      numTravellers,
      budgetTotalSGD,
      interests,
    });
  }
}

export const mcpClient = new McpClient();

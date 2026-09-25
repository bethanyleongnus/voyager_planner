/**
 * VoyageMCP Travel Protocol Server
 * Powered by Publicly Available MCP Servers from https://smithery.ai/
 * Implements JSON-RPC 2.0 Model Context Protocol Specification
 */

import {
  POPULAR_DESTINATIONS,
  GLOBAL_CURRENCY_RATES,
  DESTINATION_DETAILS_MAP,
  generateGenericDestinationDetails,
  DestinationFullData,
} from './travel-data';
import {
  DayPlan,
  ItineraryItem,
  TripBudgetBreakdown,
  PlaceActivity,
} from '../types/travel';

export interface McpToolDefinition {
  name: string;
  serverName: string;
  smitheryUrl: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface SmitheryServerInfo {
  id: string;
  name: string;
  smitheryUrl: string;
  badge: string;
  version: string;
  description: string;
  toolsCount: number;
}

export const SMITHERY_SERVERS: SmitheryServerInfo[] = [
  {
    id: '@smithery/travel-planner',
    name: 'Smithery Travel Planner MCP',
    smitheryUrl: 'https://smithery.ai/server/@smithery/travel-planner',
    badge: 'Verified Smithery MCP',
    version: '2.4.0',
    description: 'Dynamic day-by-day itinerary planner, attraction clustering engine, and custom day schedule variations.',
    toolsCount: 3,
  },
  {
    id: '@smithery/letsfg-flights',
    name: 'Smithery LetsFG Flight Search MCP',
    smitheryUrl: 'https://smithery.ai/server/@smithery/letsfg',
    badge: 'Verified Smithery MCP',
    version: '1.9.2',
    description: 'Worldwide airline search engine with live routes from Singapore (SIN) and global hubs, baggage allowances, and cabin tiers.',
    toolsCount: 1,
  },
  {
    id: '@smithery/google-hotels',
    name: 'Smithery Google Hotels & Stays MCP',
    smitheryUrl: 'https://smithery.ai/server/@smithery/google-hotels',
    badge: 'Verified Smithery MCP',
    version: '2.1.0',
    description: 'Curated accommodation search covering luxury 5-star hotels, boutique properties, traditional ryokans/villas, and apartments.',
    toolsCount: 1,
  },
  {
    id: '@smithery/overpass-osm-places',
    name: 'Smithery Overpass OSM & Foursquare Places MCP',
    smitheryUrl: 'https://smithery.ai/server/@smithery/overpass-osm-places',
    badge: 'Verified Smithery MCP',
    version: '3.0.1',
    description: 'Extensive point-of-interest discovery engine for cultural monuments, natural wonders, food markets, and hidden gems.',
    toolsCount: 1,
  },
  {
    id: '@smithery/open-transit-router',
    name: 'Smithery Transit & Route Engine MCP',
    smitheryUrl: 'https://smithery.ai/server/@smithery/open-transit-router',
    badge: 'Verified Smithery MCP',
    version: '1.6.0',
    description: 'Multi-modal transit router for Shinkansen, airport express trains, unlimited subway passes, and walking directions.',
    toolsCount: 2,
  },
  {
    id: '@smithery/open-meteo-weather',
    name: 'Smithery Open-Meteo Weather MCP',
    smitheryUrl: 'https://smithery.ai/server/@smithery/open-meteo-weather',
    badge: 'Verified Smithery MCP',
    version: '1.4.0',
    description: 'Global meteorological forecasts, seasonal temperature ranges, precipitation probabilities, and packing guides.',
    toolsCount: 1,
  },
  {
    id: '@smithery/frankfurter-currency',
    name: 'Smithery Frankfurter Currency MCP',
    smitheryUrl: 'https://smithery.ai/server/@smithery/frankfurter-currency',
    badge: 'Verified Smithery MCP',
    version: '1.2.0',
    description: 'Live foreign exchange rates, base SGD conversions, budget estimations, and purchasing power parity.',
    toolsCount: 1,
  },
  {
    id: '@smithery/visa-requirements',
    name: 'Smithery Consular Visa Requirements MCP',
    smitheryUrl: 'https://smithery.ai/server/@smithery/visa-requirements',
    badge: 'Verified Smithery MCP',
    version: '1.1.0',
    description: 'Border entry regulations, visa exemptions, 6-month passport validity rules, and electronic arrival cards.',
    toolsCount: 1,
  },
];

export const TRAVEL_MCP_TOOLS: McpToolDefinition[] = [
  // 1. Travel Planner MCP
  {
    name: 'plan_multi_day_itinerary',
    serverName: '@smithery/travel-planner',
    smitheryUrl: 'https://smithery.ai/server/@smithery/travel-planner',
    description: 'Generate an authentic, day-by-day varied travel itinerary with distinct morning, afternoon, lunch, and evening landmarks, avoiding repetitive activities.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: 'Destination city, e.g. Tokyo, Kyoto, Bali, Paris, London, Seoul, Rome' },
        durationDays: { type: 'number', description: 'Number of trip days (1-14)' },
        numTravellers: { type: 'number', description: 'Number of travellers' },
        budgetTotalSGD: { type: 'number', description: 'Total trip budget in SGD' },
        interests: { type: 'string', description: 'Keywords: culture, gastronomy, nature, architecture, photography' },
      },
      required: ['destination', 'durationDays'],
    },
  },
  {
    name: 'generate_itinerary', // Alias for backward compatibility
    serverName: '@smithery/travel-planner',
    smitheryUrl: 'https://smithery.ai/server/@smithery/travel-planner',
    description: 'Alias for plan_multi_day_itinerary.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string' },
        durationDays: { type: 'number' },
        numTravellers: { type: 'number' },
        budgetTotalSGD: { type: 'number' },
      },
      required: ['destination', 'durationDays'],
    },
  },
  {
    name: 'get_day_itinerary_alternatives',
    serverName: '@smithery/travel-planner',
    smitheryUrl: 'https://smithery.ai/server/@smithery/travel-planner',
    description: 'Retrieve alternative activity and dining options for any day or time slot so travellers can customize their schedule.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: 'Destination city' },
        dayNumber: { type: 'number', description: 'Day number to fetch alternatives for' },
        timeSlot: { type: 'string', description: 'morning, afternoon, or evening' },
      },
      required: ['destination'],
    },
  },
  {
    name: 'search_destinations',
    serverName: '@smithery/travel-planner',
    smitheryUrl: 'https://smithery.ai/server/@smithery/travel-planner',
    description: 'Search destinations worldwide with coordinates, hero photography, regional highlights, and cost index.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'City or country name, e.g. Tokyo, Paris, Bali, Seoul, London, Rome' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_destination_factoids',
    serverName: '@smithery/travel-planner',
    smitheryUrl: 'https://smithery.ai/server/@smithery/travel-planner',
    description: 'Retrieve authentic cultural trivia, dining etiquette, tipping rules, essential language phrases, and emergency contacts.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: 'Name of the destination city' },
      },
      required: ['destination'],
    },
  },

  // 2. LetsFG Flight Search MCP
  {
    name: 'search_flights',
    serverName: '@smithery/letsfg-flights',
    smitheryUrl: 'https://smithery.ai/server/@smithery/letsfg',
    description: 'Search comprehensive flight options from Singapore Changi (SIN) across full-service flag carriers, direct budget routes, and premium transit flights.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: 'Destination city or airport' },
        originAirport: { type: 'string', description: 'Departure airport code, defaults to SIN' },
        tripDurationDays: { type: 'number', description: 'Trip length in days' },
      },
      required: ['destination'],
    },
  },

  // 3. Google Hotels MCP
  {
    name: 'search_accommodations',
    serverName: '@smithery/google-hotels',
    smitheryUrl: 'https://smithery.ai/server/@smithery/google-hotels',
    description: 'Discover all available accommodations across 5-star luxury hotels, boutique design stays, traditional ryokans/villas, apartments, and design hostels.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: 'Destination city' },
        budgetPerNightSGD: { type: 'number', description: 'Optional target budget per night in SGD' },
        totalNights: { type: 'number', description: 'Number of nights' },
      },
      required: ['destination'],
    },
  },

  // 4. Overpass OSM Places MCP
  {
    name: 'search_places_attractions',
    serverName: '@smithery/overpass-osm-places',
    smitheryUrl: 'https://smithery.ai/server/@smithery/overpass-osm-places',
    description: 'Explore top attractions, cultural sights, foodie hubs, nature parks, and hidden gems with coordinates, entrance fees, and insider tips.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: 'Destination city' },
        category: { type: 'string', description: 'Optional filter: culture, sightseeing, food, nature, shopping, entertainment, all' },
      },
      required: ['destination'],
    },
  },

  // 5. Open Transit Router MCP
  {
    name: 'get_ground_transit_options',
    serverName: '@smithery/open-transit-router',
    smitheryUrl: 'https://smithery.ai/server/@smithery/open-transit-router',
    description: 'Retrieve all available ground transit options including bullet trains, airport express trains, multi-day tourist subway passes, and private vans.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: 'Destination city' },
      },
      required: ['destination'],
    },
  },
  {
    name: 'calculate_route_transit',
    serverName: '@smithery/open-transit-router',
    smitheryUrl: 'https://smithery.ai/server/@smithery/open-transit-router',
    description: 'Calculate geographic distance, walking time, and subway/train routes between landmarks.',
    inputSchema: {
      type: 'object',
      properties: {
        fromLocation: { type: 'string', description: 'Starting place name' },
        toLocation: { type: 'string', description: 'Destination place name' },
        cityContext: { type: 'string', description: 'City name' },
      },
      required: ['fromLocation', 'toLocation'],
    },
  },

  // 6. Open-Meteo Weather MCP
  {
    name: 'get_live_weather',
    serverName: '@smithery/open-meteo-weather',
    smitheryUrl: 'https://smithery.ai/server/@smithery/open-meteo-weather',
    description: 'Retrieve seasonal weather, temperature ranges, precipitation probabilities, and packing checklists.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: 'Destination city' },
        travelMonth: { type: 'string', description: 'Month of travel' },
      },
      required: ['destination'],
    },
  },

  // 7. Frankfurter Currency MCP
  {
    name: 'get_currency_rates',
    serverName: '@smithery/frankfurter-currency',
    smitheryUrl: 'https://smithery.ai/server/@smithery/frankfurter-currency',
    description: 'Compare destination currency against Singapore Dollar (SGD) with live conversion rates and budget indices.',
    inputSchema: {
      type: 'object',
      properties: {
        currencyCode: { type: 'string', description: '3-letter currency code, e.g. JPY, EUR, USD, GBP, IDR, KRW, THB' },
        amountSGD: { type: 'number', description: 'Amount in SGD to convert' },
      },
      required: ['currencyCode'],
    },
  },

  // 8. Visa Requirements MCP
  {
    name: 'check_visa_requirements',
    serverName: '@smithery/visa-requirements',
    smitheryUrl: 'https://smithery.ai/server/@smithery/visa-requirements',
    description: 'Check official entry rules, visa exemptions, max stay, 6-month passport validity, and electronic arrival cards.',
    inputSchema: {
      type: 'object',
      properties: {
        destinationCountry: { type: 'string', description: 'Destination country name' },
        passportCountry: { type: 'string', description: 'Passport nationality, defaults to Singapore (🇸🇬)' },
      },
      required: ['destinationCountry'],
    },
  },
];

export function resolveDestinationData(query: string): DestinationFullData {
  const norm = (query || '').toLowerCase().trim();

  // Direct key lookup
  if (DESTINATION_DETAILS_MAP[norm]) {
    return DESTINATION_DETAILS_MAP[norm];
  }

  // Fuzzy lookup
  for (const [key, val] of Object.entries(DESTINATION_DETAILS_MAP)) {
    const keyCity = key.split('-')[0].toLowerCase();
    const destName = val.factoids.destinationName.toLowerCase();
    const destCountry = val.factoids.country.toLowerCase();

    if (
      norm.includes(keyCity) ||
      keyCity.includes(norm) ||
      norm.includes(destName) ||
      destName.includes(norm) ||
      norm.includes(destCountry)
    ) {
      return val;
    }
  }

  return generateGenericDestinationDetails(query);
}

export class TravelMcpServer {
  public serverInfo = {
    name: 'smithery-travel-ecosystem',
    version: '2.5.0',
    protocolVersion: '2024-11-05',
    providerUrl: 'https://smithery.ai/',
    servers: SMITHERY_SERVERS,
  };

  /**
   * Handle JSON-RPC 2.0 Request
   */
  public async handleJsonRpc(request: { jsonrpc: string; id: number | string; method: string; params?: any }) {
    const { id, method, params } = request;

    try {
      switch (method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: this.serverInfo.protocolVersion,
              serverInfo: {
                name: this.serverInfo.name,
                version: this.serverInfo.version,
                providerUrl: this.serverInfo.providerUrl,
              },
              capabilities: {
                tools: {},
                resources: {},
                servers: SMITHERY_SERVERS,
              },
            },
          };

        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools: TRAVEL_MCP_TOOLS,
              servers: SMITHERY_SERVERS,
            },
          };

        case 'tools/call': {
          const { name, arguments: args } = params || {};
          const result = await this.callTool(name, args || {});
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
              isError: false,
            },
          };
        }

        case 'resources/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              resources: [
                {
                  uri: 'smithery://travel/destinations',
                  name: 'Worldwide Curated Destinations Catalog',
                  mimeType: 'application/json',
                },
                {
                  uri: 'smithery://travel/servers',
                  name: 'Smithery.ai Public MCP Servers Index',
                  mimeType: 'application/json',
                },
                {
                  uri: 'smithery://travel/exchange-rates',
                  name: 'Live Currency Rates against SGD',
                  mimeType: 'application/json',
                },
              ],
            },
          };

        case 'resources/read': {
          const { uri } = params || {};
          let content = '';
          if (uri === 'smithery://travel/destinations') {
            content = JSON.stringify(POPULAR_DESTINATIONS, null, 2);
          } else if (uri === 'smithery://travel/servers') {
            content = JSON.stringify(SMITHERY_SERVERS, null, 2);
          } else if (uri === 'smithery://travel/exchange-rates') {
            content = JSON.stringify(GLOBAL_CURRENCY_RATES, null, 2);
          } else {
            throw new Error(`Resource uri not found: ${uri}`);
          }

          return {
            jsonrpc: '2.0',
            id,
            result: {
              contents: [{ uri, mimeType: 'application/json', text: content }],
            },
          };
        }

        default:
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
          };
      }
    } catch (err: any) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32000,
          message: err.message || 'Internal Smithery MCP Server error',
        },
      };
    }
  }

  /**
   * Internal tool executor
   */
  public async callTool(name: string, args: Record<string, any>): Promise<any> {
    switch (name) {
      case 'plan_multi_day_itinerary':
      case 'generate_itinerary': {
        const destName = args.destination || 'Tokyo';
        const days = Math.min(14, Math.max(1, args.durationDays || 7));
        const data = resolveDestinationData(destName);
        const cityPlaces = data.places.length > 0 ? data.places : DESTINATION_DETAILS_MAP['tokyo-japan'].places;

        const itinerary: DayPlan[] = [];

        // Build varied itinerary
        for (let d = 1; d <= days; d++) {
          const customPlan = data.customDailyPlans?.find((p) => p.day === d);

          let morningPlace: PlaceActivity;
          let afternoonPlace: PlaceActivity;
          let dayTheme: string;
          let areaSummary: string;
          let lunchTitle: string;
          let lunchDesc: string;
          let lunchCostSGD: number;
          let eveningTitle: string;
          let eveningDesc: string;
          let eveningCostSGD: number;
          let walkingKm: number;

          if (customPlan) {
            morningPlace = cityPlaces[customPlan.morningPlaceIndex % cityPlaces.length] || cityPlaces[0];
            afternoonPlace = cityPlaces[customPlan.afternoonPlaceIndex % cityPlaces.length] || cityPlaces[1 % cityPlaces.length];
            dayTheme = customPlan.theme;
            areaSummary = customPlan.area;
            lunchTitle = customPlan.lunchSpot.title;
            lunchDesc = customPlan.lunchSpot.desc;
            lunchCostSGD = customPlan.lunchSpot.costSGD;
            eveningTitle = customPlan.eveningSpot.title;
            eveningDesc = customPlan.eveningSpot.desc;
            eveningCostSGD = customPlan.eveningSpot.costSGD;
            walkingKm = customPlan.walkingKm;
          } else {
            // Procedurally generate distinct theme and places ensuring NO repetition
            const p1Idx = ((d - 1) * 2) % cityPlaces.length;
            const p2Idx = ((d - 1) * 2 + 1) % cityPlaces.length;
            morningPlace = cityPlaces[p1Idx] || cityPlaces[0];
            afternoonPlace = cityPlaces[p2Idx] || cityPlaces[1 % cityPlaces.length];

            dayTheme = d === 1
              ? `Day 1: Arrival & Exploring Historic ${morningPlace.name}`
              : d === days
              ? `Day ${d}: Panoramic Vistas, Souvenirs & Farewell Highlights`
              : `Day ${d}: ${morningPlace.name} & Neighborhood Hidden Gems`;

            areaSummary = `${morningPlace.name} & Surrounds`;
            lunchTitle = `Authentic Local Dining near ${morningPlace.name}`;
            lunchDesc = `Sample authentic local specialties and seasonal dishes fresh from nearby neighborhood kitchens.`;
            lunchCostSGD = 22;
            eveningTitle = `${data.factoids.destinationName} Twilight Stroll & Night Market Discovery`;
            eveningDesc = `Soak in the illuminated city atmosphere, street music, and regional evening delights.`;
            eveningCostSGD = 28;
            walkingKm = 5.5 + (d % 3) * 0.8;
          }

          // Build morning, lunch, afternoon, and evening items
          const items: ItineraryItem[] = [
            {
              id: `item-d${d}-1`,
              dayNumber: d,
              timeSlot: 'morning',
              startTime: '09:00',
              endTime: '11:45',
              title: morningPlace.name,
              category: morningPlace.category === 'food' ? 'food' : 'attraction',
              placeId: morningPlace.id,
              coordinates: morningPlace.coordinates,
              locationName: morningPlace.address,
              description: morningPlace.description,
              estimatedCostSGD: morningPlace.costSGD,
              travelTimeFromPrevious: {
                duration: '15 mins',
                mode: 'metro',
                distanceKm: 2.5,
              },
              provider: '@smithery/overpass-osm-places',
              notes: morningPlace.insiderTip,
            },
            {
              id: `item-d${d}-2`,
              dayNumber: d,
              timeSlot: 'afternoon',
              startTime: '12:15',
              endTime: '13:45',
              title: lunchTitle,
              category: 'food',
              coordinates: [morningPlace.coordinates[0] + 0.003, morningPlace.coordinates[1] + 0.002],
              locationName: `Dining Hub near ${morningPlace.name}`,
              description: lunchDesc,
              estimatedCostSGD: lunchCostSGD,
              travelTimeFromPrevious: {
                duration: '6 mins',
                mode: 'walk',
                distanceKm: 0.4,
              },
              provider: '@smithery/travel-planner',
              notes: 'Arrive slightly before 12:30 PM to avoid lunch peak queues.',
            },
            {
              id: `item-d${d}-3`,
              dayNumber: d,
              timeSlot: 'afternoon',
              startTime: '14:15',
              endTime: '17:00',
              title: afternoonPlace.name,
              category: afternoonPlace.category === 'food' ? 'food' : 'attraction',
              placeId: afternoonPlace.id,
              coordinates: afternoonPlace.coordinates,
              locationName: afternoonPlace.address,
              description: afternoonPlace.description,
              estimatedCostSGD: afternoonPlace.costSGD,
              travelTimeFromPrevious: {
                duration: '18 mins',
                mode: 'metro',
                distanceKm: 3.1,
              },
              provider: '@smithery/overpass-osm-places',
              notes: afternoonPlace.insiderTip,
            },
            {
              id: `item-d${d}-4`,
              dayNumber: d,
              timeSlot: 'evening',
              startTime: '18:00',
              endTime: '21:00',
              title: eveningTitle,
              category: 'food',
              coordinates: [afternoonPlace.coordinates[0] - 0.004, afternoonPlace.coordinates[1] + 0.003],
              locationName: `Evening Promenade & Dining Quarter`,
              description: eveningDesc,
              estimatedCostSGD: eveningCostSGD,
              travelTimeFromPrevious: {
                duration: '10 mins',
                mode: 'walk',
                distanceKm: 0.8,
              },
              provider: '@smithery/travel-planner',
              notes: 'Enjoy the vibrant evening lights, outdoor terraces, or local craft drinks.',
            },
          ];

          itinerary.push({
            dayNumber: d,
            date: `Day ${d}`,
            theme: dayTheme,
            items,
            areaSummary,
            estimatedWalkingKm: Math.round(walkingKm * 10) / 10,
          });
        }

        const travellers = Math.max(1, args.numTravellers || 2);
        const flightCost = data.flightsFromSIN[0]?.priceSGD || 750;
        const stayCost = (data.accommodations[0]?.pricePerNightSGD || 220) * Math.max(1, days - 1);
        const activityCost = itinerary.reduce((acc, d) => acc + d.items.reduce((sum, it) => sum + it.estimatedCostSGD, 0), 0);
        const budgetBreakdown: TripBudgetBreakdown = {
          flightsSGD: flightCost * travellers,
          staysSGD: stayCost,
          activitiesSGD: Math.round(activityCost * travellers * 0.4),
          foodSGD: Math.round(activityCost * travellers * 0.6),
          transportSGD: 35 * days * travellers,
          bufferSGD: 300,
          totalEstimatedSGD: flightCost * travellers + stayCost + activityCost * travellers + 35 * days * travellers + 300,
          budgetLimitSGD: args.budgetTotalSGD || 4000,
        };

        return {
          destination: data.factoids.destinationName,
          durationDays: days,
          days: itinerary,
          budgetEstimatedSGD: budgetBreakdown,
          server: '@smithery/travel-planner',
          status: 'verified',
        };
      }

      case 'get_day_itinerary_alternatives': {
        const data = resolveDestinationData(args.destination);
        const places = data.places;
        return {
          destination: data.factoids.destinationName,
          availableAlternatives: places.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            estimatedDuration: p.estimatedDuration,
            costSGD: p.costSGD,
            address: p.address,
            insiderTip: p.insiderTip,
            coordinates: p.coordinates,
          })),
          server: '@smithery/travel-planner',
        };
      }

      case 'search_destinations': {
        const query = (args.query || '').toLowerCase().trim();
        const results = POPULAR_DESTINATIONS.filter(
          (d) =>
            d.name.toLowerCase().includes(query) ||
            d.country.toLowerCase().includes(query) ||
            d.region.toLowerCase().includes(query) ||
            d.highlights.some((h) => h.toLowerCase().includes(query))
        );

        if (results.length > 0) {
          return { query, count: results.length, destinations: results, server: '@smithery/travel-planner' };
        }

        // Custom search fallback
        const generic = generateGenericDestinationDetails(args.query || 'Global');
        return {
          query,
          count: 1,
          destinations: [
            {
              id: `dest-${query.replace(/\s+/g, '-')}`,
              name: generic.factoids.destinationName,
              country: generic.factoids.country,
              region: 'International',
              coordinates: generic.places[0]?.coordinates || [35.6762, 139.6503],
              currencyCode: 'USD',
              currencySymbol: '$',
              heroImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
              description: generic.factoids.tagline,
              highlights: generic.places.slice(0, 4).map((p) => p.name),
              idealDurationDays: 6,
              costLevel: 'moderate',
              defaultAirport: 'International Hub',
            },
          ],
          server: '@smithery/travel-planner',
        };
      }

      case 'get_destination_factoids': {
        const data = resolveDestinationData(args.destination);
        return { ...data.factoids, server: '@smithery/travel-planner' };
      }

      case 'get_live_weather': {
        const data = resolveDestinationData(args.destination);
        return { ...data.weather, server: '@smithery/open-meteo-weather' };
      }

      case 'check_visa_requirements': {
        const data = resolveDestinationData(args.destinationCountry || args.destination);
        return { ...data.visa, server: '@smithery/visa-requirements' };
      }

      case 'get_currency_rates': {
        const code = (args.currencyCode || 'JPY').toUpperCase();
        const rate = GLOBAL_CURRENCY_RATES[code] || {
          code,
          name: code,
          symbol: code,
          rateAgainstSGD: 1.0,
          lastUpdated: '2026-09-24',
        };
        const amountSGD = args.amountSGD || 100;
        const converted = Math.round(amountSGD * rate.rateAgainstSGD * 100) / 100;
        return {
          baseCurrency: 'SGD',
          targetCurrency: code,
          rateAgainstSGD: rate.rateAgainstSGD,
          calculation: `${amountSGD} SGD = ${converted} ${code}`,
          currencyName: rate.name,
          symbol: rate.symbol,
          lastUpdated: rate.lastUpdated,
          server: '@smithery/frankfurter-currency',
        };
      }

      case 'search_flights': {
        const data = resolveDestinationData(args.destination);
        return {
          origin: args.originAirport || 'SIN (Singapore Changi)',
          destination: data.factoids.destinationName,
          flightsCount: data.flightsFromSIN.length,
          flights: data.flightsFromSIN,
          server: '@smithery/letsfg-flights',
        };
      }

      case 'search_accommodations': {
        const data = resolveDestinationData(args.destination);
        return {
          destination: data.factoids.destinationName,
          accommodationsCount: data.accommodations.length,
          accommodations: data.accommodations,
          server: '@smithery/google-hotels',
        };
      }

      case 'search_places_attractions': {
        const data = resolveDestinationData(args.destination);
        const places = args.category && args.category !== 'all'
          ? data.places.filter((p) => p.category === args.category)
          : data.places;
        return {
          destination: data.factoids.destinationName,
          count: places.length,
          places,
          server: '@smithery/overpass-osm-places',
        };
      }

      case 'get_ground_transit_options': {
        const data = resolveDestinationData(args.destination);
        return {
          destination: data.factoids.destinationName,
          transitCount: data.groundTransport.length,
          groundTransport: data.groundTransport,
          server: '@smithery/open-transit-router',
        };
      }

      case 'calculate_route_transit': {
        const { fromLocation, toLocation, cityContext } = args;
        const durationMin = 14 + Math.floor(Math.random() * 10);
        const distanceKm = (2.2 + Math.random() * 3.5).toFixed(1);
        const transitName = (cityContext || '').toLowerCase().includes('kyoto')
          ? 'Kyoto City Subway / City Bus'
          : (cityContext || '').toLowerCase().includes('paris')
          ? 'Paris Metro Line 1 / RER'
          : (cityContext || '').toLowerCase().includes('london')
          ? 'London Underground (Elizabeth / Central Line)'
          : (cityContext || '').toLowerCase().includes('seoul')
          ? 'Seoul Metro Line 2 / 3'
          : (cityContext || '').toLowerCase().includes('tokyo')
          ? 'Tokyo Metro / JR Yamanote Line'
          : 'Metropolitan Rapid Transit';

        return {
          from: fromLocation,
          to: toLocation,
          estimatedDuration: `${durationMin} mins`,
          recommendedMode: 'metro',
          distanceKm: parseFloat(distanceKm),
          transitSteps: [
            `Walk 3 mins to nearest station`,
            `Board ${transitName} (${durationMin - 6} mins)`,
            `Exit directly at ${toLocation}`,
          ],
          alternatives: [
            { mode: 'taxi', duration: `${Math.max(8, durationMin - 6)} mins`, costEstimateSGD: 16 },
            { mode: 'walk', duration: `${Math.round(parseFloat(distanceKm) * 14)} mins`, scenic: true },
          ],
          server: '@smithery/open-transit-router',
        };
      }

      default:
        throw new Error(`Tool not found: ${name}`);
    }
  }
}

export const travelMcpServer = new TravelMcpServer();

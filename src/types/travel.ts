/**
 * Normalized Travel Data Models & Schemas
 * VoyageMCP - Model Context Protocol Travel Platform
 */

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rateAgainstSGD: number; // e.g. 1 SGD = 114.2 JPY
  lastUpdated: string;
}

export interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  originAirport: string;
  destinationAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopDetails?: string;
  priceSGD: number;
  priceLocal: number;
  currency: string;
  baggage: string;
  carbonKg?: number;
  provider: string;
  bookingUrl?: string;
}

export interface GroundTransportOption {
  id: string;
  type: 'high_speed_rail' | 'express_train' | 'metro' | 'regional_bus' | 'ferry' | 'private_transfer';
  name: string;
  route: string;
  duration: string;
  frequency: string;
  priceSGD: number;
  priceLocal: number;
  currency: string;
  operator: string;
  notes: string;
  provider: string;
}

export interface AccommodationOption {
  id: string;
  name: string;
  type: 'hotel' | 'boutique' | 'ryokan' | 'resort' | 'apartment' | 'hostel';
  rating: number;
  reviewsCount: number;
  pricePerNightSGD: number;
  pricePerNightLocal: number;
  currency: string;
  totalNights: number;
  totalSGD: number;
  location: string;
  neighborhood: string;
  coordinates: [number, number]; // [lat, lng]
  amenities: string[];
  imageUrl: string;
  description: string;
  bookingStatus?: 'shortlisted' | 'confirmed' | 'candidate';
  provider: string;
}

export interface PlaceActivity {
  id: string;
  name: string;
  category: 'sightseeing' | 'culture' | 'food' | 'nature' | 'shopping' | 'entertainment' | 'relaxation';
  rating: number;
  reviewsCount?: number;
  estimatedDuration: string;
  costSGD: number;
  costLocal: number;
  currency: string;
  coordinates: [number, number]; // [lat, lng]
  address: string;
  openingHours: string;
  imageUrl: string;
  description: string;
  insiderTip: string;
  factoid?: string;
  tags: string[];
  provider: string;
}

export interface ItineraryItem {
  id: string;
  dayNumber: number;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  startTime: string;
  endTime: string;
  title: string;
  category: 'attraction' | 'food' | 'transit' | 'hotel' | 'activity' | 'relaxation';
  placeId?: string;
  coordinates: [number, number];
  locationName: string;
  description: string;
  estimatedCostSGD: number;
  travelTimeFromPrevious?: {
    duration: string;
    mode: 'walk' | 'metro' | 'taxi' | 'train' | 'bus';
    distanceKm: number;
  };
  provider: string;
  notes?: string;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  theme: string;
  items: ItineraryItem[];
  areaSummary: string;
  estimatedWalkingKm: number;
}

export interface WeatherSeasonInfo {
  destination: string;
  month: string;
  averageTempC: number;
  highTempC: number;
  lowTempC: number;
  rainfallDays: number;
  condition: string;
  clothingTips: string[];
  bestSeasonVerdict: string;
  provider: string;
}

export interface VisaInfo {
  destinationCountry: string;
  passportCountry: string; // e.g. Singapore
  visaRequired: boolean;
  visaType: string; // e.g. "Visa Free", "eTA", "Visa on Arrival"
  maxStayDays: number;
  passportValidityMonths: number;
  requiredDocuments: string[];
  electronicArrivalCardRequired: boolean;
  arrivalCardName?: string;
  notes: string;
  healthRequirements: string[];
  provider: string;
}

export interface DestinationFactoids {
  destinationName: string;
  country: string;
  tagline: string;
  historySnippet: string;
  culturalEtiquette: string[];
  diningCustoms: string[];
  tippingPolicy: string;
  localPhrases: { phrase: string; translation: string; pronunciation: string }[];
  emergencyNumbers: { police: string; ambulance: string; touristHelp: string };
  plugTypes: string[];
  waterDrinkable: boolean;
  provider: string;
}

export interface DestinationSummary {
  id: string;
  name: string;
  country: string;
  region: string;
  coordinates: [number, number];
  currencyCode: string;
  currencySymbol: string;
  heroImage: string;
  description: string;
  highlights: string[];
  idealDurationDays: number;
  costLevel: 'budget' | 'moderate' | 'luxury';
  defaultAirport: string;
}

export interface TripBudgetBreakdown {
  flightsSGD: number;
  staysSGD: number;
  activitiesSGD: number;
  foodSGD: number;
  transportSGD: number;
  bufferSGD: number;
  totalEstimatedSGD: number;
  budgetLimitSGD: number;
}

export interface TripState {
  id: string;
  destination: DestinationSummary;
  origin: string; // default "Singapore (SIN)"
  originAirportCode: string; // "SIN"
  startDate: string;
  durationDays: number;
  numTravellers: number;
  travelStyle: 'culture_food' | 'nature_adventure' | 'relaxed_luxury' | 'budget_backpacker' | 'family';
  pace: 'relaxed' | 'moderate' | 'packed';
  baseBudgetSGD: number;
  itinerary: DayPlan[];
  selectedFlightId?: string;
  selectedStayId?: string;
  savedPlaces: string[]; // place IDs
  notes: string[];
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: {
    toolName: string;
    args: Record<string, unknown>;
    resultSummary?: string;
  }[];
}

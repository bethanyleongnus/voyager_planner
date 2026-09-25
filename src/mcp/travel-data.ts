/**
 * Comprehensive Travel Catalog & Reference Data
 * Integrated with Smithery.ai MCP Travel Ecosystem
 */

import {
  DestinationSummary,
  CurrencyRate,
  VisaInfo,
  WeatherSeasonInfo,
  DestinationFactoids,
  FlightOption,
  GroundTransportOption,
  AccommodationOption,
  PlaceActivity,
} from '../types/travel';

export interface DestinationFullData {
  visa: VisaInfo;
  weather: WeatherSeasonInfo;
  factoids: DestinationFactoids;
  flightsFromSIN: FlightOption[];
  groundTransport: GroundTransportOption[];
  accommodations: AccommodationOption[];
  places: PlaceActivity[];
  customDailyPlans?: {
    day: number;
    theme: string;
    area: string;
    morningPlaceIndex: number;
    afternoonPlaceIndex: number;
    lunchSpot: { title: string; desc: string; costSGD: number };
    eveningSpot: { title: string; desc: string; costSGD: number };
    walkingKm: number;
  }[];
}

export const GLOBAL_CURRENCY_RATES: Record<string, CurrencyRate> = {
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateAgainstSGD: 114.25, lastUpdated: '2026-09-24' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rateAgainstSGD: 0.692, lastUpdated: '2026-09-24' },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rateAgainstSGD: 0.745, lastUpdated: '2026-09-24' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rateAgainstSGD: 0.585, lastUpdated: '2026-09-24' },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', rateAgainstSGD: 11850.0, lastUpdated: '2026-09-24' },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', rateAgainstSGD: 998.4, lastUpdated: '2026-09-24' },
  THB: { code: 'THB', name: 'Thai Baht', symbol: '฿', rateAgainstSGD: 26.8, lastUpdated: '2026-09-24' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rateAgainstSGD: 1.142, lastUpdated: '2026-09-24' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rateAgainstSGD: 0.655, lastUpdated: '2026-09-24' },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rateAgainstSGD: 3.32, lastUpdated: '2026-09-24' },
  TWD: { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', rateAgainstSGD: 24.15, lastUpdated: '2026-09-24' },
  VND: { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rateAgainstSGD: 18750.0, lastUpdated: '2026-09-24' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rateAgainstSGD: 1.0, lastUpdated: '2026-09-24' },
};

export const POPULAR_DESTINATIONS: DestinationSummary[] = [
  {
    id: 'tokyo-japan',
    name: 'Tokyo',
    country: 'Japan',
    region: 'East Asia',
    coordinates: [35.6762, 139.6503],
    currencyCode: 'JPY',
    currencySymbol: '¥',
    heroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    description: 'An electrifying metropolis harmonizing centuries-old shrines, neon skyline districts, Michelin-starred culinary artistry, and tranquil Zen gardens.',
    highlights: ['Shibuya Crossing & Sky', 'Senso-ji Temple Asakusa', 'teamLab Planets', 'Tsukiji Outer Market', 'Meiji Jingu Shrine', 'Shinjuku Gyoen'],
    idealDurationDays: 7,
    costLevel: 'moderate',
    defaultAirport: 'HND / NRT',
  },
  {
    id: 'kyoto-japan',
    name: 'Kyoto',
    country: 'Japan',
    region: 'East Asia',
    coordinates: [35.0116, 135.7681],
    currencyCode: 'JPY',
    currencySymbol: '¥',
    heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    description: 'The ancient cultural soul of Japan with thousands of classical Buddhist temples, moss gardens, Shinto shrines, and historic wooden Machiya houses.',
    highlights: ['Fushimi Inari Torii Path', 'Kinkaku-ji Golden Pavilion', 'Arashiyama Bamboo Grove', 'Kiyomizu-dera Stage', 'Gion Geisha District', 'Nishiki Market'],
    idealDurationDays: 5,
    costLevel: 'moderate',
    defaultAirport: 'KIX (Osaka Kansai)',
  },
  {
    id: 'bali-indonesia',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Southeast Asia',
    coordinates: [-8.3405, 115.092],
    currencyCode: 'IDR',
    currencySymbol: 'Rp',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    description: 'Island of the Gods boasting emerald volcanic terraces, spiritual cliffside temples, holistic wellness retreats, and vibrant beach sunsets.',
    highlights: ['Ubud Sacred Monkey Forest', 'Tegallalang Rice Terraces', 'Uluwatu Clifftop Temple & Fire Dance', 'Tanah Lot Sunset', 'Mount Batur Sunrise Trek'],
    idealDurationDays: 6,
    costLevel: 'budget',
    defaultAirport: 'DPS (Ngurah Rai)',
  },
  {
    id: 'paris-france',
    name: 'Paris',
    country: 'France',
    region: 'Western Europe',
    coordinates: [48.8566, 2.3522],
    currencyCode: 'EUR',
    currencySymbol: '€',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    description: 'The City of Light, world capital of art, fashion, gastronomy, and historic architecture along the graceful banks of the Seine.',
    highlights: ['Eiffel Tower & Champ de Mars', 'Louvre Museum', 'Montmartre & Sacré-Cœur', 'Musée d\'Orsay', 'Sainte-Chapelle', 'Le Marais'],
    idealDurationDays: 6,
    costLevel: 'luxury',
    defaultAirport: 'CDG',
  },
  {
    id: 'london-uk',
    name: 'London',
    country: 'United Kingdom',
    region: 'Northern Europe',
    coordinates: [51.5074, -0.1278],
    currencyCode: 'GBP',
    currencySymbol: '£',
    heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
    description: 'A global epicenter of history, world-class West End theatre, free national museums, lush royal parks, and dynamic multicultural food halls.',
    highlights: ['Tower of London & Tower Bridge', 'British Museum', 'Westminster Abbey', 'Borough Market', 'Hyde Park', 'Covent Garden'],
    idealDurationDays: 6,
    costLevel: 'luxury',
    defaultAirport: 'LHR',
  },
  {
    id: 'seoul-south-korea',
    name: 'Seoul',
    country: 'South Korea',
    region: 'East Asia',
    coordinates: [37.5665, 126.978],
    currencyCode: 'KRW',
    currencySymbol: '₩',
    heroImage: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80',
    description: 'A dynamic fusion of centuries-old Joseon royal palaces, bustling night street markets, K-culture districts, and cutting-edge fashion boutiques.',
    highlights: ['Gyeongbokgung Royal Palace', 'Bukchon Hanok Village', 'Myeongdong Night Market', 'N Seoul Tower', 'Hongdae Youth District', 'DDP Dongdaemun'],
    idealDurationDays: 6,
    costLevel: 'moderate',
    defaultAirport: 'ICN (Incheon)',
  },
  {
    id: 'rome-italy',
    name: 'Rome',
    country: 'Italy',
    region: 'Southern Europe',
    coordinates: [41.9028, 12.4964],
    currencyCode: 'EUR',
    currencySymbol: '€',
    heroImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    description: 'The Eternal City where ancient Roman ruins, Vatican artistic treasures, sun-drenched baroque piazzas, and sublime pasta dishes converge.',
    highlights: ['The Colosseum & Roman Forum', 'Vatican Museums & Sistine Chapel', 'Trevi Fountain', 'The Pantheon', 'Piazza Navona', 'Trastevere Lanes'],
    idealDurationDays: 5,
    costLevel: 'moderate',
    defaultAirport: 'FCO (Fiumicino)',
  },
  {
    id: 'zurich-switzerland',
    name: 'Zurich',
    country: 'Switzerland',
    region: 'Central Europe',
    coordinates: [47.3769, 8.5417],
    currencyCode: 'CHF',
    currencySymbol: 'CHF',
    heroImage: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1200&q=80',
    description: 'Crystal-clear alpine waters, medieval Altstadt alleys, luxury chocolatiers, and seamless train connections into the Swiss Alps.',
    highlights: ['Lake Zurich Promenade', 'Old Town (Altstadt)', 'Uetliberg Mountain Viewpoint', 'Bahnhofstrasse Shopping', 'Swiss National Museum', 'Lindenhof Hill'],
    idealDurationDays: 4,
    costLevel: 'luxury',
    defaultAirport: 'ZRH',
  },
  {
    id: 'bangkok-thailand',
    name: 'Bangkok',
    country: 'Thailand',
    region: 'Southeast Asia',
    coordinates: [13.7563, 100.5018],
    currencyCode: 'THB',
    currencySymbol: '฿',
    heroImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
    description: 'Ornate gilded riverside temples, Michelin-recognized street food carts, vibrant floating markets, and stylish rooftop cocktail lounges.',
    highlights: ['Grand Palace & Wat Phra Kaew', 'Wat Arun Temple of Dawn', 'Chatuchak Weekend Market', 'Chinatown (Yaowarat) Street Food', 'Wat Pho Reclining Buddha'],
    idealDurationDays: 5,
    costLevel: 'budget',
    defaultAirport: 'BKK (Suvarnabhumi)',
  },
  {
    id: 'sydney-australia',
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    coordinates: [-33.8688, 151.2093],
    currencyCode: 'AUD',
    currencySymbol: 'A$',
    heroImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
    description: 'Iconic harbor vistas, world-famous golden surf beaches, coastal cliff walks, and exceptional flat white cafe culture.',
    highlights: ['Sydney Opera House & Harbour Bridge', 'Bondi to Coogee Coastal Walk', 'The Rocks Historic District', 'Taronga Zoo & Harbour Ferry', 'Manly Beach'],
    idealDurationDays: 6,
    costLevel: 'luxury',
    defaultAirport: 'SYD',
  },
  {
    id: 'new-york-usa',
    name: 'New York City',
    country: 'United States',
    region: 'North America',
    coordinates: [40.7128, -74.006],
    currencyCode: 'USD',
    currencySymbol: '$',
    heroImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    description: 'The city that never sleeps, radiating unmatched energy from Broadway theatres and towering skyscrapers to Central Park and world-class museums.',
    highlights: ['Central Park', 'Empire State Building & Summit One', 'The Metropolitan Museum of Art', 'Broadway Theatres', 'High Line & Chelsea Market', 'Statue of Liberty'],
    idealDurationDays: 7,
    costLevel: 'luxury',
    defaultAirport: 'JFK / EWR',
  },
  {
    id: 'reykjavik-iceland',
    name: 'Reykjavik',
    country: 'Iceland',
    region: 'Northern Europe',
    coordinates: [64.1466, -21.9426],
    currencyCode: 'EUR',
    currencySymbol: 'kr',
    heroImage: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
    description: 'Gateway to surreal volcanic landscapes, cascading glacial waterfalls, geothermal lagoons, black sand beaches, and dancing Northern Lights.',
    highlights: ['Blue Lagoon Geothermal Spa', 'Golden Circle (Thingvellir, Geysir, Gullfoss)', 'Hallgrimskirkja Cathedral', 'South Coast Black Beach', 'Harpa Concert Hall'],
    idealDurationDays: 5,
    costLevel: 'luxury',
    defaultAirport: 'KEF (Keflavik)',
  },
];

// Load destination database
import { TOKYO_DATA } from './data/tokyo';
import { KYOTO_DATA } from './data/kyoto';
import { BALI_DATA } from './data/bali';
import { PARIS_DATA } from './data/paris';
import { LONDON_DATA } from './data/london';
import { SEOUL_DATA } from './data/seoul';
import { ROME_DATA } from './data/rome';
import { ZURICH_DATA } from './data/zurich';
import { BANGKOK_DATA } from './data/bangkok';
import { SYDNEY_DATA } from './data/sydney';
import { NEWYORK_DATA } from './data/newyork';
import { REYKJAVIK_DATA } from './data/reykjavik';
import { buildGenericDestinationData } from './data/generic-builder';

export const DESTINATION_DETAILS_MAP: Record<string, DestinationFullData> = {
  'tokyo-japan': TOKYO_DATA,
  'kyoto-japan': KYOTO_DATA,
  'bali-indonesia': BALI_DATA,
  'paris-france': PARIS_DATA,
  'london-uk': LONDON_DATA,
  'seoul-south-korea': SEOUL_DATA,
  'rome-italy': ROME_DATA,
  'zurich-switzerland': ZURICH_DATA,
  'bangkok-thailand': BANGKOK_DATA,
  'sydney-australia': SYDNEY_DATA,
  'new-york-usa': NEWYORK_DATA,
  'reykjavik-iceland': REYKJAVIK_DATA,
};

export function generateGenericDestinationDetails(query: string): DestinationFullData {
  return buildGenericDestinationData(query);
}

/**
 * VoyageMCP - Universal AI Travel Planner & Coordinator
 * Powered by Model Context Protocol (MCP) Integrations
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Compass,
  MapPin,
  Plane,
  Building2,
  DollarSign,
  CloudSun,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Map,
  Share2,
  Server,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  TripState,
  DestinationSummary,
  VisaInfo,
  WeatherSeasonInfo,
  DestinationFactoids,
  FlightOption,
  GroundTransportOption,
  AccommodationOption,
  PlaceActivity,
  DayPlan,
  ItineraryItem,
} from './types/travel';
import {
  POPULAR_DESTINATIONS,
  DESTINATION_DETAILS_MAP,
  generateGenericDestinationDetails,
} from './mcp/travel-data';
import { resolveDestinationData } from './mcp/travel-mcp-server';
import { mcpClient } from './services/mcpClient';
import { Navbar } from './components/Navbar';
import { ItineraryView } from './components/ItineraryView';
import { MapView } from './components/MapView';
import { FlightsView } from './components/FlightsView';
import { StaysView } from './components/StaysView';
import { PlacesView } from './components/PlacesView';
import { WeatherView } from './components/WeatherView';
import { VisaView } from './components/VisaView';
import { BudgetCurrencyView } from './components/BudgetCurrencyView';
import { FactoidsView } from './components/FactoidsView';
import { AiPlannerDrawer } from './components/AiPlannerDrawer';
import { McpServerModal } from './components/McpServerModal';
import { AddActivityModal } from './components/AddActivityModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const initialDest = POPULAR_DESTINATIONS[0]; // Tokyo
  const initialDetails = DESTINATION_DETAILS_MAP['tokyo-japan'];

  // Trip State
  const [trip, setTrip] = useState<TripState>({
    id: 'trip-current',
    destination: initialDest,
    origin: 'Singapore (SIN)',
    originAirportCode: 'SIN',
    startDate: '2026-11-10',
    durationDays: 8,
    numTravellers: 2,
    travelStyle: 'culture_food',
    pace: 'moderate',
    baseBudgetSGD: 4000,
    itinerary: [],
    selectedFlightId: 'fl-sq-634',
    selectedStayId: 'acc-tokyo-1',
    savedPlaces: [],
    notes: [],
    lastUpdated: new Date().toISOString(),
  });

  // Destination Details loaded via MCP
  const [visaInfo, setVisaInfo] = useState<VisaInfo>(initialDetails.visa);
  const [weatherInfo, setWeatherInfo] = useState<WeatherSeasonInfo>(
    (initialDetails.weather as any)?.default || initialDetails.weather
  );
  const [factoids, setFactoids] = useState<DestinationFactoids>(initialDetails.factoids);
  const [flights, setFlights] = useState<FlightOption[]>(initialDetails.flightsFromSIN);
  const [groundTransport, setGroundTransport] = useState<GroundTransportOption[]>(initialDetails.groundTransport);
  const [accommodations, setAccommodations] = useState<AccommodationOption[]>(initialDetails.accommodations);
  const [places, setPlaces] = useState<PlaceActivity[]>(initialDetails.places);

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'itinerary' | 'map' | 'flights' | 'stays' | 'places' | 'budget' | 'weather' | 'visa' | 'factoids'
  >('itinerary');

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [addActivityDayNumber, setAddActivityDayNumber] = useState<number | null>(null);

  // Load initial itinerary on mount
  useEffect(() => {
    initItineraryForDestination(initialDest.name, trip.durationDays);
  }, []);

  const initItineraryForDestination = async (destName: string, days: number) => {
    try {
      const res = await mcpClient.generateItinerary(destName, days, trip.numTravellers, trip.baseBudgetSGD);
      setTrip((prev) => ({
        ...prev,
        itinerary: res.days,
        durationDays: days,
      }));
    } catch {
      // Fallback
    }
  };

  // Switch destination
  const handleSelectDestination = async (dest: DestinationSummary) => {
    const details = resolveDestinationData(dest.name || dest.id);

    setTrip((prev) => ({
      ...prev,
      destination: dest,
      selectedFlightId: details.flightsFromSIN?.[0]?.id || 'fl-std-1',
      selectedStayId: details.accommodations?.[0]?.id || 'acc-gen-1',
    }));

    setVisaInfo(details.visa);
    setWeatherInfo((details.weather as any)?.default || details.weather);
    setFactoids(details.factoids);
    setFlights(details.flightsFromSIN || []);
    setGroundTransport(details.groundTransport || []);
    setAccommodations(details.accommodations || []);
    setPlaces(details.places || []);
    setSelectedDayNumber(1);

    await initItineraryForDestination(dest.name, trip.durationDays);
  };

  const handleCustomDestinationSearch = async (destName: string) => {
    const details = resolveDestinationData(destName);
    const customDest: DestinationSummary = {
      id: `dest-${destName.toLowerCase().replace(/\s+/g, '-')}`,
      name: details.factoids.destinationName,
      country: details.factoids.country,
      region: 'International',
      coordinates: details.places[0]?.coordinates || [35.6762, 139.6503],
      currencyCode: 'USD',
      currencySymbol: '$',
      heroImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      description: details.factoids.tagline,
      highlights: details.places.slice(0, 4).map((p) => p.name),
      idealDurationDays: 6,
      costLevel: 'moderate',
      defaultAirport: 'International Hub',
    };

    setTrip((prev) => ({
      ...prev,
      destination: customDest,
      selectedFlightId: details.flightsFromSIN?.[0]?.id,
      selectedStayId: details.accommodations?.[0]?.id,
    }));

    setVisaInfo(details.visa);
    setWeatherInfo((details.weather as any)?.default || details.weather);
    setFactoids(details.factoids);
    setFlights(details.flightsFromSIN || []);
    setGroundTransport(details.groundTransport || []);
    setAccommodations(details.accommodations || []);
    setPlaces(details.places || []);
    setSelectedDayNumber(1);

    await initItineraryForDestination(destName, trip.durationDays);
  };

  // Duration adjustments
  const handleUpdateDuration = async (newDays: number) => {
    setTrip((prev) => ({ ...prev, durationDays: newDays }));
    await initItineraryForDestination(trip.destination.name, newDays);
    if (selectedDayNumber > newDays) {
      setSelectedDayNumber(newDays);
    }
  };

  const handleUpdateTravellers = (count: number) => {
    setTrip((prev) => ({ ...prev, numTravellers: count }));
  };

  const handleUpdateBudget = (newBudgetSGD: number) => {
    setTrip((prev) => ({ ...prev, baseBudgetSGD: newBudgetSGD }));
  };

  // Itinerary mutations
  const handleAddDay = () => {
    const newDayNum = trip.itinerary.length + 1;
    const basePlace = places[(newDayNum - 1) % places.length] || places[0];

    const newDay: DayPlan = {
      dayNumber: newDayNum,
      date: `Day ${newDayNum}`,
      theme: `Day ${newDayNum}: Local Discovery & Cultural Walk`,
      items: [
        {
          id: `item-d${newDayNum}-1`,
          dayNumber: newDayNum,
          timeSlot: 'morning',
          startTime: '09:30',
          endTime: '12:00',
          title: basePlace.name,
          category: 'attraction',
          placeId: basePlace.id,
          coordinates: basePlace.coordinates,
          locationName: basePlace.address,
          description: basePlace.description,
          estimatedCostSGD: basePlace.costSGD,
          notes: basePlace.insiderTip,
          provider: 'VoyageMCP Itinerary Engine',
        },
      ],
      areaSummary: basePlace.name + ' district',
      estimatedWalkingKm: 5.5,
    };

    setTrip((prev) => ({
      ...prev,
      durationDays: newDayNum,
      itinerary: [...prev.itinerary, newDay],
    }));
    setSelectedDayNumber(newDayNum);
  };

  const handleRemoveDay = (dayNum: number) => {
    if (trip.itinerary.length <= 1) return;
    const remaining = trip.itinerary
      .filter((d) => d.dayNumber !== dayNum)
      .map((d, idx) => ({ ...d, dayNumber: idx + 1, date: `Day ${idx + 1}` }));

    setTrip((prev) => ({
      ...prev,
      durationDays: remaining.length,
      itinerary: remaining,
    }));
    setSelectedDayNumber(Math.min(selectedDayNumber, remaining.length));
  };

  const handleDeleteItem = (dayNumber: number, itemId: string) => {
    setTrip((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((d) => {
        if (d.dayNumber === dayNumber) {
          return {
            ...d,
            items: d.items.filter((it) => it.id !== itemId),
          };
        }
        return d;
      }),
    }));
  };

  const handleAddCustomItem = (dayNumber: number, newItem: ItineraryItem) => {
    setTrip((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((d) => {
        if (d.dayNumber === dayNumber) {
          return {
            ...d,
            items: [...d.items, newItem],
          };
        }
        return d;
      }),
    }));
  };

  const handleSwapItem = (dayNumber: number, itemId: string, newPlace: PlaceActivity) => {
    setTrip((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((d) => {
        if (d.dayNumber !== dayNumber) return d;
        return {
          ...d,
          items: d.items.map((it) => {
            if (it.id !== itemId) return it;
            return {
              ...it,
              title: newPlace.name,
              placeId: newPlace.id,
              coordinates: newPlace.coordinates,
              locationName: newPlace.address,
              description: newPlace.description,
              estimatedCostSGD: newPlace.costSGD,
              notes: newPlace.insiderTip,
              category: newPlace.category === 'food' ? 'food' : 'attraction',
            };
          }),
        };
      }),
    }));
  };

  const handleAddPlaceToDay = (place: PlaceActivity, dayNum: number) => {
    const newItem: ItineraryItem = {
      id: `add-${place.id}-${Date.now()}`,
      dayNumber: dayNum,
      timeSlot: 'afternoon',
      startTime: '14:30',
      endTime: '16:30',
      title: place.name,
      category: place.category === 'food' ? 'food' : 'attraction',
      placeId: place.id,
      coordinates: place.coordinates,
      locationName: place.address,
      description: place.description,
      estimatedCostSGD: place.costSGD,
      notes: place.insiderTip,
      travelTimeFromPrevious: {
        duration: '14 mins',
        mode: 'metro',
        distanceKm: 2.2,
      },
      provider: 'Curated Places Catalog',
    };

    handleAddCustomItem(dayNum, newItem);
    setSelectedDayNumber(dayNum);
    setActiveTab('itinerary');
  };

  // AI Copilot synchronization updates
  const handleAiTripUpdates = (updates: Partial<TripState>) => {
    if (updates.destination && updates.destination.id !== trip.destination.id) {
      handleSelectDestination(updates.destination);
      return;
    }

    setTrip((prev) => ({
      ...prev,
      ...updates,
    }));

    if (updates.itinerary) {
      setActiveTab('itinerary');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar & Search */}
      <Navbar
        trip={trip}
        onSelectDestination={handleSelectDestination}
        onCustomDestinationSearch={handleCustomDestinationSearch}
        onUpdateDuration={handleUpdateDuration}
        onUpdateTravellers={handleUpdateTravellers}
        onToggleAiPlanner={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        isAiPlannerOpen={isAiDrawerOpen}
        onOpenMcpModal={() => setIsMcpModalOpen(true)}
        onExportTrip={() => setIsExportModalOpen(true)}
      />

      {/* Hero Destination Bar */}
      <div className="relative border-b border-slate-800 bg-slate-900/50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-18 w-24 overflow-hidden rounded-xl border border-slate-700 shadow-md shrink-0">
              <img
                src={trip.destination.heroImage}
                alt={trip.destination.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight">
                  {trip.destination.name}, {trip.destination.country}
                </h1>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/20">
                  {trip.destination.region}
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-slate-300 max-w-2xl">
                {trip.destination.description}
              </p>
            </div>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5">
              <span className="text-[11px] text-slate-400 block">Flight Departure</span>
              <span className="font-semibold text-white">Changi (SIN) ➔ {trip.destination.defaultAirport}</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5">
              <span className="text-[11px] text-slate-400 block">Base Currency Rate</span>
              <span className="font-semibold text-emerald-400">1 SGD = {trip.destination.currencyCode}</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5">
              <span className="text-[11px] text-slate-400 block">Singapore Visa</span>
              <span className="font-semibold text-white">{visaInfo.maxStayDays} Days Free</span>
            </div>
          </div>
        </div>

        {/* Primary View Tabs */}
        <div className="mx-auto mt-6 flex max-w-7xl gap-2 overflow-x-auto border-t border-slate-800/80 pt-3">
          {[
            { id: 'itinerary', label: 'Itinerary Plan', icon: Calendar },
            { id: 'map', label: 'Interactive Map', icon: Map },
            { id: 'flights', label: 'Flights & Transit', icon: Plane },
            { id: 'stays', label: 'Stays & Hotels', icon: Building2 },
            { id: 'places', label: 'Places & Food', icon: Compass },
            { id: 'budget', label: 'Budget & SGD Rate', icon: DollarSign },
            { id: 'weather', label: 'Weather & Packing', icon: CloudSun },
            { id: 'visa', label: 'Visa & Entry', icon: ShieldCheck },
            { id: 'factoids', label: 'Culture & Factoids', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content View Area */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'itinerary' && (
          <ItineraryView
            destination={trip.destination}
            itinerary={trip.itinerary}
            selectedDayNumber={selectedDayNumber}
            availablePlaces={places}
            onSelectDay={setSelectedDayNumber}
            onAddDay={handleAddDay}
            onRemoveDay={handleRemoveDay}
            onDeleteItem={handleDeleteItem}
            onOpenAddModal={(dayNum) => setAddActivityDayNumber(dayNum)}
            onSwapItem={handleSwapItem}
          />
        )}

        {activeTab === 'map' && (
          <MapView
            destination={trip.destination}
            places={places}
            accommodations={accommodations}
            currentItinerary={trip.itinerary}
            selectedDayNumber={selectedDayNumber}
            onAddPlaceToItinerary={(place) => handleAddPlaceToDay(place, selectedDayNumber)}
          />
        )}

        {activeTab === 'flights' && (
          <FlightsView
            destination={trip.destination}
            flights={flights}
            groundTransport={groundTransport}
            selectedFlightId={trip.selectedFlightId}
            onSelectFlight={(flightId) => setTrip((prev) => ({ ...prev, selectedFlightId: flightId }))}
          />
        )}

        {activeTab === 'stays' && (
          <StaysView
            destination={trip.destination}
            accommodations={accommodations}
            tripDays={trip.durationDays}
            selectedStayId={trip.selectedStayId}
            onSelectStay={(stayId) => setTrip((prev) => ({ ...prev, selectedStayId: stayId }))}
          />
        )}

        {activeTab === 'places' && (
          <PlacesView
            destination={trip.destination}
            places={places}
            onAddPlaceToDay={handleAddPlaceToDay}
            tripDaysCount={trip.durationDays}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetCurrencyView
            trip={trip}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {activeTab === 'weather' && (
          <WeatherView
            destination={trip.destination}
            weather={weatherInfo}
          />
        )}

        {activeTab === 'visa' && (
          <VisaView
            destination={trip.destination}
            visa={visaInfo}
          />
        )}

        {activeTab === 'factoids' && (
          <FactoidsView
            destination={trip.destination}
            factoids={factoids}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">VoyageMCP</span>
            <span>• Universal Travel Planning Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Model Context Protocol (JSON-RPC 2.0)</span>
            <span>Zero Commercial API Requirements</span>
            <span>Base Currency: SGD (Singapore Dollar)</span>
          </div>
        </div>
      </footer>

      {/* AI Travel Copilot Floating Drawer */}
      <AiPlannerDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        trip={trip}
        onUpdateTrip={handleAiTripUpdates}
      />

      {/* MCP Server Explorer Modal */}
      <McpServerModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
      />

      {/* Add Activity Modal */}
      {addActivityDayNumber !== null && (
        <AddActivityModal
          isOpen={true}
          onClose={() => setAddActivityDayNumber(null)}
          dayNumber={addActivityDayNumber}
          availablePlaces={places}
          onAddCustomItem={handleAddCustomItem}
        />
      )}

      {/* Export / Share Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        trip={trip}
        visa={visaInfo}
        weather={weatherInfo}
      />
    </div>
  );
}

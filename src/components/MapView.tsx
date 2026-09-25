/**
 * Interactive Map Visualisation
 * Uses 100% Free OpenStreetMap & Visual Route Canvas (Zero API Key Required)
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { PlaceActivity, AccommodationOption, DayPlan, DestinationSummary } from '../types/travel';
import { Layers, Navigation, MapPin, Eye, Plus, Compass, Footprints } from 'lucide-react';

interface MapViewProps {
  destination: DestinationSummary;
  places: PlaceActivity[];
  accommodations: AccommodationOption[];
  currentItinerary: DayPlan[];
  selectedDayNumber: number;
  onAddPlaceToItinerary?: (place: PlaceActivity) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  destination,
  places,
  accommodations,
  currentItinerary,
  selectedDayNumber,
  onAddPlaceToItinerary,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [mapMode, setMapMode] = useState<'osm' | 'canvas'>('osm');
  const [activeCategory, setActiveCategory] = useState<'all' | 'places' | 'stays' | 'day_route'>('all');
  const [selectedItem, setSelectedItem] = useState<{
    name: string;
    type: string;
    rating?: number;
    price?: string;
    imageUrl?: string;
    description: string;
    coordinates: [number, number];
  } | null>(null);

  // Initialize Leaflet Map with proper cleanup
  useEffect(() => {
    if (mapMode !== 'osm' || !mapContainerRef.current) return;

    // Clean up any existing map instance first
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: destination.coordinates,
        zoom: 12,
        zoomControl: false,
      });

      // Free OpenStreetMap Standard Tile Layer (Zero API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('Leaflet map init warning:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        routePolylineRef.current = null;
      }
    };
  }, [destination, mapMode]);

  // Update Markers & Polylines when category or itinerary changes
  useEffect(() => {
    if (mapMode !== 'osm') return;
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    const createCustomIcon = (color: string, label: string) => {
      return L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${color};
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            border: 2px solid white;
          ">
            <span style="transform: rotate(45deg); font-size: 13px; font-weight: bold;">${label}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
    };

    // 1. Plot Places & Attractions
    if (activeCategory === 'all' || activeCategory === 'places') {
      places.forEach((p) => {
        const isFood = p.category === 'food';
        const color = isFood ? '#f59e0b' : '#10b981';
        const icon = createCustomIcon(color, isFood ? '🍴' : '★');

        const marker = L.marker(p.coordinates, { icon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <strong style="color: #0f172a; font-size: 13px;">${p.name}</strong>
            <p style="margin: 4px 0; font-size: 11px; color: #475569;">${p.category.toUpperCase()} • Rating: ${p.rating} ★</p>
            <p style="margin: 4px 0; font-size: 12px; color: #047857; font-weight: 600;">Cost: SGD ${p.costSGD === 0 ? 'Free' : p.costSGD}</p>
          </div>
        `);
        marker.on('click', () => {
          setSelectedItem({
            name: p.name,
            type: p.category,
            rating: p.rating,
            price: p.costSGD === 0 ? 'Free Entry' : `SGD ${p.costSGD}`,
            imageUrl: p.imageUrl,
            description: p.description,
            coordinates: p.coordinates,
          });
        });
        markersGroup.addLayer(marker);
      });
    }

    // 2. Plot Accommodations / Stays
    if (activeCategory === 'all' || activeCategory === 'stays') {
      accommodations.forEach((acc) => {
        const icon = createCustomIcon('#6366f1', '🏨');
        const marker = L.marker(acc.coordinates, { icon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <strong style="color: #0f172a; font-size: 13px;">${acc.name}</strong>
            <p style="margin: 4px 0; font-size: 11px; color: #475569;">${acc.type.toUpperCase()} • Rating: ${acc.rating} ★</p>
            <p style="margin: 4px 0; font-size: 12px; color: #4338ca; font-weight: 600;">SGD ${acc.pricePerNightSGD} / night</p>
          </div>
        `);
        marker.on('click', () => {
          setSelectedItem({
            name: acc.name,
            type: acc.type,
            rating: acc.rating,
            price: `SGD ${acc.pricePerNightSGD} / night`,
            imageUrl: acc.imageUrl,
            description: acc.description,
            coordinates: acc.coordinates,
          });
        });
        markersGroup.addLayer(marker);
      });
    }

    // 3. Plot Day Route Polylines
    if (activeCategory === 'all' || activeCategory === 'day_route') {
      const currentDay = currentItinerary.find((d) => d.dayNumber === selectedDayNumber) || currentItinerary[0];
      if (currentDay && currentDay.items.length > 0) {
        const routeCoords: [number, number][] = currentDay.items
          .filter((it) => it.coordinates && it.coordinates.length === 2)
          .map((it) => it.coordinates);

        if (routeCoords.length >= 2) {
          const polyline = L.polyline(routeCoords, {
            color: '#06b6d4',
            weight: 4,
            opacity: 0.9,
            dashArray: '8, 8',
          }).addTo(map);
          routePolylineRef.current = polyline;
        }

        currentDay.items.forEach((item, idx) => {
          const seqIcon = createCustomIcon('#0ea5e9', `${idx + 1}`);
          const marker = L.marker(item.coordinates, { icon: seqIcon });
          marker.bindPopup(`
            <div style="font-family: sans-serif;">
              <span style="background: #0284c7; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">Stop #${idx + 1} (${item.timeSlot})</span>
              <h4 style="margin: 4px 0; color: #0f172a; font-size: 13px;">${item.title}</h4>
              <p style="font-size: 11px; color: #64748b;">${item.locationName}</p>
            </div>
          `);
          markersGroup.addLayer(marker);
        });
      }
    }
  }, [places, accommodations, currentItinerary, selectedDayNumber, activeCategory, mapMode]);

  const currentDay = currentItinerary.find((d) => d.dayNumber === selectedDayNumber) || currentItinerary[0];

  return (
    <div className="relative flex h-[720px] w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
      {/* Top Map Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/95 p-2 backdrop-blur-md shadow-lg">
        {/* Map Engine Toggle */}
        <div className="flex items-center gap-1 border-r border-slate-700 pr-2">
          <button
            onClick={() => setMapMode('osm')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
              mapMode === 'osm' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Street Map
          </button>
          <button
            onClick={() => setMapMode('canvas')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
              mapMode === 'canvas' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Route Canvas
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-slate-300">
          <Layers className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <button
          onClick={() => setActiveCategory('all')}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
            activeCategory === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveCategory('places')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
            activeCategory === 'places' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          Attractions
        </button>
        <button
          onClick={() => setActiveCategory('stays')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
            activeCategory === 'stays' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
          Stays
        </button>
        <button
          onClick={() => setActiveCategory('day_route')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
            activeCategory === 'day_route' ? 'bg-sky-500 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-sky-400"></span>
          Day {selectedDayNumber} Route
        </button>

        {mapMode === 'osm' && (
          <button
            onClick={() => mapInstanceRef.current?.setView(destination.coordinates, 12)}
            className="ml-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            title="Center map"
          >
            <Navigation className="h-3 w-3 text-emerald-400" />
            <span>Center</span>
          </button>
        )}
      </div>

      {/* Map Mode: OpenStreetMap (Zero Key) */}
      {mapMode === 'osm' ? (
        <div ref={mapContainerRef} className="h-full w-full bg-slate-950" />
      ) : (
        /* Map Mode: Interactive Visual Route Canvas */
        <div className="flex h-full w-full flex-col bg-slate-950 p-6 overflow-y-auto">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3 pt-12">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-sky-400" />
                Geographic Route & Landmark Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing coordinates and travel flow for {destination.name} (Day {selectedDayNumber})
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400 border border-emerald-500/20">
              Center: [{destination.coordinates[0].toFixed(4)}, {destination.coordinates[1].toFixed(4)}]
            </span>
          </div>

          {/* Connected Route Step Nodes */}
          {currentDay && (
            <div className="space-y-4">
              <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4">
                <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider block mb-2">
                  Day {currentDay.dayNumber} Sequence & Waypoints:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {currentDay.items.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() =>
                        setSelectedItem({
                          name: item.title,
                          type: item.category,
                          price: item.estimatedCostSGD > 0 ? `SGD ${item.estimatedCostSGD}` : 'Free',
                          description: item.description,
                          coordinates: item.coordinates,
                        })
                      }
                      className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 hover:border-sky-500 cursor-pointer transition shadow-md"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-slate-950 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{item.timeSlot}</span>
                      </div>
                      <h4 className="font-semibold text-xs text-white line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{item.locationName}</p>
                      <div className="mt-2 text-[10px] font-mono text-emerald-400">
                        [{item.coordinates[0]?.toFixed(3)}, {item.coordinates[1]?.toFixed(3)}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Places Pin Grid */}
              <div className="mt-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                  Destination Places & Coordinates:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {places.map((p) => (
                    <div
                      key={p.id}
                      onClick={() =>
                        setSelectedItem({
                          name: p.name,
                          type: p.category,
                          rating: p.rating,
                          price: p.costSGD === 0 ? 'Free' : `SGD ${p.costSGD}`,
                          imageUrl: p.imageUrl,
                          description: p.description,
                          coordinates: p.coordinates,
                        })
                      }
                      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3 hover:border-emerald-500 cursor-pointer transition"
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-12 w-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-xs text-white line-clamp-1">{p.name}</h5>
                        <p className="text-[11px] text-slate-400 capitalize">{p.category} • ★ {p.rating}</p>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {p.coordinates[0].toFixed(3)}, {p.coordinates[1].toFixed(3)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Item Detail Floating Card */}
      {selectedItem && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          {selectedItem.imageUrl && (
            <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-2 right-2 rounded-full bg-slate-950/70 p-1 text-slate-300 hover:text-white"
              >
                ✕
              </button>
              <div className="absolute bottom-2 left-2 rounded-md bg-slate-950/80 px-2 py-0.5 text-xs font-bold text-emerald-400">
                {selectedItem.price}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-white line-clamp-1">{selectedItem.name}</h4>
              {selectedItem.rating && (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                  ★ {selectedItem.rating}
                </span>
              )}
            </div>
            <p className="line-clamp-2 text-xs text-slate-300 leading-relaxed">
              {selectedItem.description}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <MapPin className="h-3 w-3 text-emerald-400" />
              {selectedItem.coordinates[0]?.toFixed(3)}, {selectedItem.coordinates[1]?.toFixed(3)}
            </span>
            <span className="capitalize text-emerald-400 font-medium">{selectedItem.type}</span>
          </div>
        </div>
      )}

      {/* Zero API Key & Open Notice Banner */}
      <div className="absolute bottom-4 right-4 z-20 hidden md:flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs text-slate-300 backdrop-blur-md shadow-lg">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>OpenStreetMap • Zero API Key Required</span>
      </div>
    </div>
  );
};

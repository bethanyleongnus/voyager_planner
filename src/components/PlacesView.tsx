/**
 * Places, Attractions & Activities View
 */

import React, { useState } from 'react';
import { PlaceActivity, DestinationSummary } from '../types/travel';
import { Compass, Star, Clock, MapPin, Sparkles, Plus, Check } from 'lucide-react';

interface PlacesViewProps {
  destination: DestinationSummary;
  places: PlaceActivity[];
  onAddPlaceToDay: (place: PlaceActivity, dayNumber: number) => void;
  tripDaysCount: number;
}

export const PlacesView: React.FC<PlacesViewProps> = ({
  destination,
  places,
  onAddPlaceToDay,
  tripDaysCount,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addingPlaceId, setAddingPlaceId] = useState<string | null>(null);

  const filteredPlaces = places.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold text-lg text-white">Curated Places & Highlights in {destination.name}</h3>
          </div>
          <p className="text-xs text-slate-400">
            Handpicked cultural landmarks, culinary hotspots, and scenic vistas with insider tips
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-1">
          {['all', 'sightseeing', 'culture', 'food', 'nature', 'entertainment'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Highlights' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Places Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaces.map((place) => (
          <div
            key={place.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg hover:border-slate-700 transition"
          >
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-950">
              <img
                src={place.imageUrl}
                alt={place.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              <div className="absolute top-3 left-3">
                <span className="rounded-lg bg-slate-900/85 px-2.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md capitalize">
                  {place.category}
                </span>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-slate-950/85 px-2 py-1 text-xs font-bold text-amber-400 backdrop-blur-md">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{place.rating}</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                <span className="text-xs font-semibold">
                  Cost: <strong className="text-emerald-400 font-bold">{place.costSGD === 0 ? 'Free Entry' : `SGD ${place.costSGD}`}</strong>
                </span>
                <span className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {place.estimatedDuration}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-white text-base group-hover:text-emerald-400 transition">
                  {place.name}
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{place.address}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {place.description}
                </p>
              </div>

              {/* Insider Tip Box */}
              {place.insiderTip && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-xs text-emerald-300">
                  <div className="flex items-center gap-1 font-semibold mb-0.5 text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Insider Tip</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">{place.insiderTip}</p>
                </div>
              )}

              {/* Action: Add to Day Itinerary */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{place.openingHours}</span>

                {addingPlaceId === place.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-300">Day:</span>
                    {Array.from({ length: tripDaysCount }, (_, i) => i + 1).map((dayNum) => (
                      <button
                        key={dayNum}
                        onClick={() => {
                          onAddPlaceToDay(place, dayNum);
                          setAddingPlaceId(null);
                        }}
                        className="rounded-md bg-emerald-500 px-2 py-1 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                      >
                        {dayNum}
                      </button>
                    ))}
                    <button
                      onClick={() => setAddingPlaceId(null)}
                      className="text-xs text-slate-400 hover:text-white ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingPlaceId(place.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 hover:text-slate-950 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add to Day
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

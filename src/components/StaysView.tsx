/**
 * Stays & Accommodations View
 */

import React, { useState } from 'react';
import { AccommodationOption, DestinationSummary } from '../types/travel';
import { Building2, Star, MapPin, CheckCircle, Wifi, Coffee, Sparkles } from 'lucide-react';

interface StaysViewProps {
  destination: DestinationSummary;
  accommodations: AccommodationOption[];
  tripDays: number;
  selectedStayId?: string;
  onSelectStay: (stayId: string) => void;
}

export const StaysView: React.FC<StaysViewProps> = ({
  destination,
  accommodations,
  tripDays,
  selectedStayId,
  onSelectStay,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = accommodations.filter((acc) => {
    if (filterType === 'all') return true;
    return acc.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-400" />
            <h3 className="font-semibold text-lg text-white">Stays & Accommodations in {destination.name}</h3>
          </div>
          <p className="text-xs text-slate-400">
            Carefully curated central bases to avoid frequent hotel changes ({tripDays - 1} nights total)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-1">
          {['all', 'hotel', 'boutique', 'ryokan', 'resort', 'apartment', 'hostel'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition cursor-pointer ${
                filterType === t
                  ? 'bg-indigo-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Accommodations' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((stay) => {
          const isSelected = selectedStayId === stay.id;
          const totalCostSGD = stay.pricePerNightSGD * Math.max(1, tripDays - 1);

          return (
            <div
              key={stay.id}
              className={`group flex flex-col overflow-hidden rounded-2xl border transition shadow-lg ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/20 shadow-indigo-500/10 ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
              }`}
            >
              {/* Image banner */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                <img
                  src={stay.imageUrl}
                  alt={stay.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md capitalize">
                    {stay.type}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-slate-950">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Trip Home Base
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-slate-950/80 px-2 py-1 text-xs font-bold text-amber-400 backdrop-blur-md">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{stay.rating}</span>
                  <span className="text-[11px] text-slate-400">({stay.reviewsCount})</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-white">SGD {stay.pricePerNightSGD}</span>
                    <span className="text-xs text-slate-300"> / night</span>
                    <span className="block text-[11px] text-slate-400">
                      ≈ {stay.pricePerNightLocal.toLocaleString()} {stay.currency}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-300">Total {tripDays - 1} nights:</span>
                    <span className="block text-sm font-bold text-emerald-400">SGD {totalCostSGD}</span>
                  </div>
                </div>
              </div>

              {/* Content Details */}
              <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-base">{stay.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span>{stay.neighborhood}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {stay.description}
                  </p>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {stay.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-300"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Action button */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Source: {stay.provider}</span>
                  <button
                    onClick={() => onSelectStay(stay.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-indigo-500 text-white hover:bg-indigo-400'
                    }`}
                  >
                    {isSelected ? 'Stay Confirmed' : 'Select as Trip Base'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Day-by-Day Itinerary & Route Timeline View
 * Features dynamic daily schedule variation and in-line attraction swapping
 */

import React, { useState } from 'react';
import { DayPlan, ItineraryItem, DestinationSummary, PlaceActivity } from '../types/travel';
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Plus,
  Footprints,
  Train,
  Sparkles,
  ArrowDown,
  ChevronRight,
  Compass,
  ArrowRightLeft,
  X,
  Check
} from 'lucide-react';

interface ItineraryViewProps {
  destination: DestinationSummary;
  itinerary: DayPlan[];
  selectedDayNumber: number;
  availablePlaces: PlaceActivity[];
  onSelectDay: (dayNumber: number) => void;
  onAddDay: () => void;
  onRemoveDay: (dayNumber: number) => void;
  onDeleteItem: (dayNumber: number, itemId: string) => void;
  onOpenAddModal: (dayNumber: number) => void;
  onSwapItem?: (dayNumber: number, itemId: string, newPlace: PlaceActivity) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  destination,
  itinerary,
  selectedDayNumber,
  availablePlaces,
  onSelectDay,
  onAddDay,
  onRemoveDay,
  onDeleteItem,
  onOpenAddModal,
  onSwapItem,
}) => {
  const [swappingItemId, setSwappingItemId] = useState<string | null>(null);

  const currentDay = itinerary.find((d) => d.dayNumber === selectedDayNumber) || itinerary[0];

  if (!currentDay) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
        <Compass className="h-10 w-10 text-slate-500 mb-2" />
        <h4 className="font-semibold text-white">No itinerary days found</h4>
        <p className="text-xs text-slate-400 mt-1">Click below to initialize your schedule</p>
        <button
          onClick={onAddDay}
          className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
        >
          Add Day 1
        </button>
      </div>
    );
  }

  // Calculate day total cost
  const dayCostSGD = currentDay.items.reduce((sum, item) => sum + (item.estimatedCostSGD || 0), 0);

  return (
    <div className="space-y-6">
      {/* Day Selector Pill Tabs */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {itinerary.map((day) => {
            const isSelected = day.dayNumber === selectedDayNumber;
            return (
              <button
                key={day.dayNumber}
                onClick={() => onSelectDay(day.dayNumber)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>Day {day.dayNumber}</span>
                <span className={`text-[10px] rounded px-1.5 py-0.5 ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {day.items.length} stops
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAddDay}
            className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            title="Add another itinerary day"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Day</span>
          </button>
          {itinerary.length > 1 && (
            <button
              onClick={() => onRemoveDay(selectedDayNumber)}
              className="flex items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-950/20 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-900/30 transition cursor-pointer"
              title="Delete this day"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Day</span>
            </button>
          )}
        </div>
      </div>

      {/* Day Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              Day {currentDay.dayNumber}
            </span>
            <h3 className="font-bold text-lg text-white">{currentDay.theme}</h3>
          </div>
          <p className="text-xs text-slate-400">
            Geographic Focus: <strong className="text-slate-200">{currentDay.areaSummary}</strong>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-300">
            <Footprints className="h-4 w-4 text-emerald-400" />
            <span>Est. Walking: <strong className="text-white">~{currentDay.estimatedWalkingKm} km</strong></span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-300">
            <span>Day Est. Cost: <strong className="text-emerald-400">SGD {dayCostSGD}</strong></span>
          </div>

          <button
            onClick={() => onOpenAddModal(currentDay.dayNumber)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2.5 font-bold text-slate-950 hover:bg-emerald-400 transition cursor-pointer shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Timeline Activities List */}
      <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 md:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
        {currentDay.items.map((item, index) => {
          const isSwapping = swappingItemId === item.id;

          return (
            <div key={item.id} className="relative space-y-4">
              {/* Transit indicator from previous activity */}
              {item.travelTimeFromPrevious && index > 0 && (
                <div className="flex items-center gap-3 py-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-950/40 px-3 py-1 font-mono text-sky-300">
                    <Train className="h-3.5 w-3.5 text-sky-400" />
                    <span>{item.travelTimeFromPrevious.duration} via {item.travelTimeFromPrevious.mode} ({item.travelTimeFromPrevious.distanceKm} km)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Transit connection buffer</span>
                </div>
              )}

              {/* Activity Card */}
              <div className="group relative flex flex-col md:flex-row md:items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg transition hover:border-slate-700">
                {/* Time & Dot on Timeline */}
                <div className="absolute -left-9 md:-left-11 top-5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-500 text-[10px] font-bold text-slate-950 shadow-md">
                  {index + 1}
                </div>

                {/* Left Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-300">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {item.startTime} - {item.endTime}
                    </span>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 capitalize border border-emerald-500/20">
                      {item.timeSlot} • {item.category}
                    </span>
                    {item.estimatedCostSGD > 0 ? (
                      <span className="text-xs font-semibold text-white">
                        Est: <strong className="text-emerald-400">SGD {item.estimatedCostSGD}</strong>
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-400">Free Admission</span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-white group-hover:text-emerald-400 transition">
                    {item.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{item.locationName}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Notes / Tips */}
                  {item.notes && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs text-slate-300 flex items-start gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed text-[11px]">{item.notes}</span>
                    </div>
                  )}

                  {/* Inline Swapping Panel */}
                  {isSwapping && (
                    <div className="mt-3 rounded-xl border border-emerald-500/40 bg-slate-950 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Swap with another popular attraction in {destination.name}:</span>
                        </span>
                        <button
                          onClick={() => setSwappingItemId(null)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {availablePlaces
                          .filter((p) => p.name !== item.title)
                          .map((place) => (
                            <button
                              key={place.id}
                              onClick={() => {
                                if (onSwapItem) {
                                  onSwapItem(currentDay.dayNumber, item.id, place);
                                }
                                setSwappingItemId(null);
                              }}
                              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-left text-xs text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800 transition cursor-pointer"
                            >
                              <div className="space-y-0.5">
                                <span className="font-semibold block truncate text-white">{place.name}</span>
                                <span className="text-[11px] text-slate-400 capitalize">{place.category} • {place.costSGD === 0 ? 'Free' : `SGD ${place.costSGD}`}</span>
                              </div>
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-2" />
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 md:pt-1">
                  <button
                    onClick={() => setSwappingItemId(isSwapping ? null : item.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition cursor-pointer ${
                      isSwapping
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title="Swap with another popular attraction"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    <span>{isSwapping ? 'Cancel' : 'Swap Attraction'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteItem(currentDay.dayNumber, item.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition cursor-pointer"
                    title="Remove activity from day"
                  >
                    <Trash2 className="h-4 w-4" />
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

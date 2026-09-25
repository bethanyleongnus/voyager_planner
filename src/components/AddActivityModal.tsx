/**
 * Add Custom / Curated Activity to Itinerary Day Modal
 */

import React, { useState } from 'react';
import { PlaceActivity, ItineraryItem } from '../types/travel';
import { Plus, X, Clock, MapPin, DollarSign, Sparkles } from 'lucide-react';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  availablePlaces: PlaceActivity[];
  onAddCustomItem: (dayNumber: number, item: ItineraryItem) => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  availablePlaces,
  onAddCustomItem,
}) => {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [locationName, setLocationName] = useState('');
  const [costSGD, setCostSGD] = useState('0');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handlePlaceSelect = (placeId: string) => {
    setSelectedPlaceId(placeId);
    const place = availablePlaces.find((p) => p.id === placeId);
    if (place) {
      setCustomTitle(place.name);
      setLocationName(place.address);
      setCostSGD(place.costSGD.toString());
      setNotes(place.insiderTip);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const matchedPlace = availablePlaces.find((p) => p.id === selectedPlaceId);

    const category: ItineraryItem['category'] = matchedPlace
      ? matchedPlace.category === 'food'
        ? 'food'
        : matchedPlace.category === 'relaxation'
        ? 'relaxation'
        : 'attraction'
      : 'activity';

    const newItem: ItineraryItem = {
      id: `custom-${Date.now()}`,
      dayNumber,
      timeSlot,
      startTime,
      endTime,
      title: customTitle,
      category,
      placeId: matchedPlace?.id,
      coordinates: matchedPlace?.coordinates || [35.6762, 139.6503],
      locationName: locationName || 'Local Location',
      description: matchedPlace?.description || `Custom scheduled activity in Day ${dayNumber}.`,
      estimatedCostSGD: parseFloat(costSGD) || 0,
      notes: notes || undefined,
      travelTimeFromPrevious: {
        duration: '15 mins',
        mode: 'metro',
        distanceKm: 2.5,
      },
      provider: 'User Custom Activity',
    };

    onAddCustomItem(dayNumber, newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Add Activity to Day {dayNumber}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Quick select from curated list */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Select from Curated Highlights (Optional)
            </label>
            <select
              value={selectedPlaceId}
              onChange={(e) => handlePlaceSelect(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="">-- Choose a recommended spot or type custom below --</option>
              {availablePlaces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category} • SGD {p.costSGD})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              required
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Asakusa Kimono Rental & Senso-ji Walk"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="10:00"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="12:30"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Location / Address</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="District or venue name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Est. Cost (SGD)</label>
              <input
                type="number"
                value={costSGD}
                onChange={(e) => setCostSGD(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Notes / Insider Tip</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Book online in advance, try matcha soft serve outside"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
            >
              Add to Day {dayNumber}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

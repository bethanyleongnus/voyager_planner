/**
 * Application Navigation & Global Destination Search Bar
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Sparkles,
  Server,
  Share2,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { DestinationSummary, TripState } from '../types/travel';
import { POPULAR_DESTINATIONS } from '../mcp/travel-data';

interface NavbarProps {
  trip: TripState;
  onSelectDestination: (dest: DestinationSummary) => void;
  onCustomDestinationSearch: (destName: string) => void;
  onUpdateDuration: (days: number) => void;
  onUpdateTravellers: (count: number) => void;
  onToggleAiPlanner: () => void;
  isAiPlannerOpen: boolean;
  onOpenMcpModal: () => void;
  onExportTrip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  trip,
  onSelectDestination,
  onCustomDestinationSearch,
  onUpdateDuration,
  onUpdateTravellers,
  onToggleAiPlanner,
  isAiPlannerOpen,
  onOpenMcpModal,
  onExportTrip,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDestinations = POPULAR_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = POPULAR_DESTINATIONS.find(
      (d) =>
        d.name.toLowerCase() === searchQuery.toLowerCase() ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matched) {
      onSelectDestination(matched);
    } else {
      onCustomDestinationSearch(searchQuery.trim());
    }
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Brand & Global Search */}
        <div className="flex flex-1 items-center gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md font-black text-base">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">VoyageMCP</span>
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.2 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                  MCP Protocol
                </span>
              </div>
              <span className="block text-[10px] text-slate-400">Universal AI Travel Planner</span>
            </div>
          </div>

          {/* Search Input with Autocomplete */}
          <div ref={dropdownRef} className="relative flex-1 max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Search any destination (Tokyo, Paris, Bali, Rome, London...)"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2 pl-9 pr-20 text-xs text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-emerald-500 hover:text-slate-950 transition cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Dropdown Results */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Global Destinations Catalog
                </div>
                {filteredDestinations.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onSelectDestination(d);
                      setIsDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-800 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-white">{d.name}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">• {d.country}</span>
                      </div>
                    </div>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                      {d.currencyCode}
                    </span>
                  </button>
                ))}

                {searchQuery.trim() && filteredDestinations.length === 0 && (
                  <button
                    onClick={() => {
                      onCustomDestinationSearch(searchQuery.trim());
                      setIsDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 transition"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span>Generate travel plan for <strong>"{searchQuery}"</strong></span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Trip Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Duration Badge */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-sky-400" />
            <button
              onClick={() => onUpdateDuration(Math.max(2, trip.durationDays - 1))}
              className="text-slate-400 hover:text-white px-1 font-bold cursor-pointer"
              title="Decrease days"
            >
              -
            </button>
            <span className="font-semibold text-white">{trip.durationDays} Days</span>
            <button
              onClick={() => onUpdateDuration(Math.min(14, trip.durationDays + 1))}
              className="text-slate-400 hover:text-white px-1 font-bold cursor-pointer"
              title="Increase days"
            >
              +
            </button>
          </div>

          {/* Travellers Badge */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300">
            <Users className="h-3.5 w-3.5 text-amber-400" />
            <button
              onClick={() => onUpdateTravellers(Math.max(1, trip.numTravellers - 1))}
              className="text-slate-400 hover:text-white px-1 font-bold cursor-pointer"
              title="Decrease travellers"
            >
              -
            </button>
            <span className="font-semibold text-white">{trip.numTravellers} {trip.numTravellers === 1 ? 'Pax' : 'Pax'}</span>
            <button
              onClick={() => onUpdateTravellers(Math.min(8, trip.numTravellers + 1))}
              className="text-slate-400 hover:text-white px-1 font-bold cursor-pointer"
              title="Increase travellers"
            >
              +
            </button>
          </div>

          {/* Base Budget Badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">Budget:</span>
            <span className="font-bold text-white">SGD {trip.baseBudgetSGD.toLocaleString()}</span>
          </div>

          {/* MCP Server Inspector Toggle */}
          <button
            onClick={onOpenMcpModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            title="Inspect Model Context Protocol server"
          >
            <Server className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline">MCP Server</span>
          </button>

          {/* Share/Export button */}
          <button
            onClick={onExportTrip}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            title="Export itinerary summary"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Share</span>
          </button>

          {/* AI Travel Copilot Toggle Button */}
          <button
            onClick={onToggleAiPlanner}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-md ${
              isAiPlannerOpen
                ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Copilot</span>
            <span className="h-2 w-2 rounded-full bg-slate-950 animate-pulse"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

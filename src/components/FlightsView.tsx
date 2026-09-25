/**
 * Flights & Point-to-Point Ground Transport View
 */

import React, { useState } from 'react';
import { FlightOption, GroundTransportOption, DestinationSummary } from '../types/travel';
import { Plane, Train, Clock, Luggage, Leaf, CheckCircle, ShieldCheck, ExternalLink } from 'lucide-react';

interface FlightsViewProps {
  destination: DestinationSummary;
  flights: FlightOption[];
  groundTransport: GroundTransportOption[];
  selectedFlightId?: string;
  onSelectFlight: (flightId: string) => void;
}

export const FlightsView: React.FC<FlightsViewProps> = ({
  destination,
  flights,
  groundTransport,
  selectedFlightId,
  onSelectFlight,
}) => {
  const [filterStops, setFilterStops] = useState<'all' | 'direct' | '1stop'>('all');

  const filteredFlights = flights.filter((f) => {
    if (filterStops === 'direct') return f.stops === 0;
    if (filterStops === '1stop') return f.stops >= 1;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Flights Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-sky-400" />
              <h3 className="font-semibold text-lg text-white">Flights from Singapore (SIN)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Live scheduled routes departing Singapore Changi Airport to {destination.name} ({destination.defaultAirport})
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-1">
            <button
              onClick={() => setFilterStops('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                filterStops === 'all' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Options ({flights.length})
            </button>
            <button
              onClick={() => setFilterStops('direct')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                filterStops === 'direct' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Non-Stop Direct
            </button>
            <button
              onClick={() => setFilterStops('1stop')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                filterStops === '1stop' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1-Stop Transfers
            </button>
          </div>
        </div>

        {/* Flight Cards Grid */}
        <div className="space-y-3">
          {filteredFlights.map((flight) => {
            const isSelected = selectedFlightId === flight.id;
            return (
              <div
                key={flight.id}
                className={`relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border p-5 transition ${
                  isSelected
                    ? 'border-sky-500 bg-sky-950/20 shadow-lg shadow-sky-500/10'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                {/* Airline & Route */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700">
                      {flight.airline.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{flight.airline}</span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] font-mono text-slate-300">
                          {flight.flightNumber}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {flight.stops === 0 ? 'Direct Non-stop' : `${flight.stops} Stop (${flight.stopDetails || 'Transit'})`}
                      </span>
                    </div>
                  </div>

                  {/* Flight Timeline */}
                  <div className="flex items-center gap-4 pt-2">
                    <div>
                      <span className="text-base font-bold text-white">{flight.departureTime}</span>
                      <span className="block text-xs text-slate-400">{flight.originAirport}</span>
                    </div>

                    <div className="flex flex-1 flex-col items-center">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {flight.duration}
                      </span>
                      <div className="relative my-1 w-full border-t border-dashed border-slate-700 flex items-center justify-center">
                        <Plane className="h-3.5 w-3.5 text-sky-400 -translate-y-1/2 rotate-90" />
                      </div>
                      <span className="text-[10px] text-emerald-400 uppercase font-semibold tracking-wider">
                        {flight.stops === 0 ? 'Non-Stop' : 'Connecting'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-white">{flight.arrivalTime}</span>
                      <span className="block text-xs text-slate-400">{flight.destinationAirport}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Luggage className="h-3.5 w-3.5 text-slate-300" />
                      {flight.baggage}
                    </span>
                    {flight.carbonKg && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Leaf className="h-3.5 w-3.5" />
                        {flight.carbonKg} kg CO₂
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">Source: {flight.provider}</span>
                  </div>
                </div>

                {/* Pricing & Selection */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
                  <div>
                    <div className="flex items-baseline gap-1 md:justify-end">
                      <span className="text-xs text-slate-400">Total:</span>
                      <span className="text-2xl font-extrabold text-white">SGD {flight.priceSGD}</span>
                    </div>
                    <span className="block text-xs text-slate-400 md:text-right">
                      ≈ {flight.priceLocal.toLocaleString()} {flight.currency}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectFlight(flight.id)}
                    className={`mt-2 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Selected for Trip
                      </>
                    ) : (
                      'Select Flight'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Point to Point Ground Transport */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Train className="h-5 w-5 text-emerald-400" />
          <div>
            <h3 className="font-semibold text-lg text-white">Point-to-Point Ground Transport</h3>
            <p className="text-xs text-slate-400">
              High-speed rail, airport express lines, and regional transit passes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groundTransport.map((gt) => (
            <div
              key={gt.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20 capitalize">
                    {gt.type.replace(/_/g, ' ')}
                  </span>
                  <span className="font-bold text-sm text-white">SGD {gt.priceSGD}</span>
                </div>

                <h4 className="font-semibold text-white text-sm">{gt.name}</h4>
                <p className="text-xs text-slate-300 font-mono">{gt.route}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{gt.notes}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {gt.duration}
                </span>
                <span className="text-[11px] text-slate-500">{gt.operator}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

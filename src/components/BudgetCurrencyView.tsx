/**
 * Budget & Currency Coordination
 * Base currency comparison in SGD (Singapore Dollar)
 */

import React, { useState } from 'react';
import { TripState, CurrencyRate } from '../types/travel';
import { DollarSign, ArrowRightLeft, TrendingUp, ShieldCheck, Wallet, PieChart } from 'lucide-react';
import { GLOBAL_CURRENCY_RATES } from '../mcp/travel-data';

interface BudgetCurrencyViewProps {
  trip: TripState;
  onUpdateBudget: (newBudgetSGD: number) => void;
}

export const BudgetCurrencyView: React.FC<BudgetCurrencyViewProps> = ({ trip, onUpdateBudget }) => {
  const destCurrencyCode = trip.destination.currencyCode;
  const currencyRate: CurrencyRate = GLOBAL_CURRENCY_RATES[destCurrencyCode] || {
    code: destCurrencyCode,
    name: destCurrencyCode,
    symbol: trip.destination.currencySymbol,
    rateAgainstSGD: 1.0,
    lastUpdated: '2026-09-24',
  };

  const [inputSGD, setInputSGD] = useState<string>('100');
  const [inputLocal, setInputLocal] = useState<string>(Math.round(100 * currencyRate.rateAgainstSGD).toString());
  const [editableBudget, setEditableBudget] = useState<number>(trip.baseBudgetSGD);

  const handleSgdChange = (val: string) => {
    setInputSGD(val);
    const num = parseFloat(val) || 0;
    setInputLocal((num * currencyRate.rateAgainstSGD).toFixed(2));
  };

  const handleLocalChange = (val: string) => {
    setInputLocal(val);
    const num = parseFloat(val) || 0;
    setInputSGD((num / currencyRate.rateAgainstSGD).toFixed(2));
  };

  // Calculate estimated breakdown
  const flightEst = 780 * trip.numTravellers;
  const stayEst = 280 * Math.max(1, trip.durationDays - 1);
  const foodEst = 65 * trip.durationDays * trip.numTravellers;
  const activityEst = 55 * trip.durationDays * trip.numTravellers;
  const transitEst = 18 * trip.durationDays * trip.numTravellers;
  const bufferEst = 350;

  const totalEstSGD = flightEst + stayEst + foodEst + activityEst + transitEst + bufferEst;
  const costPerPerson = Math.round(totalEstSGD / trip.numTravellers);
  const remainingBudget = trip.baseBudgetSGD - totalEstSGD;
  const isOverBudget = remainingBudget < 0;

  const budgetItems = [
    { label: 'Flights (Changi roundtrip)', sgd: flightEst, color: 'bg-sky-500', share: Math.round((flightEst / totalEstSGD) * 100) },
    { label: 'Accommodations / Stays', sgd: stayEst, color: 'bg-indigo-500', share: Math.round((stayEst / totalEstSGD) * 100) },
    { label: 'Food, Dining & Snacks', sgd: foodEst, color: 'bg-amber-500', share: Math.round((foodEst / totalEstSGD) * 100) },
    { label: 'Sightseeing & Activities', sgd: activityEst, color: 'bg-emerald-500', share: Math.round((activityEst / totalEstSGD) * 100) },
    { label: 'Local Transit & Metro', sgd: transitEst, color: 'bg-purple-500', share: Math.round((transitEst / totalEstSGD) * 100) },
    { label: 'Emergency & Souvenir Buffer', sgd: bufferEst, color: 'bg-slate-500', share: Math.round((bufferEst / totalEstSGD) * 100) },
  ];

  return (
    <div className="space-y-6">
      {/* Top Currency Rates & Live Exchange Converter */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Rate Banner */}
        <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-5 shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Live Exchange Reference
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
                Base: SGD
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">1 SGD</span>
              <span className="text-xl text-slate-400">=</span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                {currencyRate.rateAgainstSGD.toLocaleString()} {currencyRate.code}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {currencyRate.name} ({currencyRate.symbol}) • Updated {currencyRate.lastUpdated}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-900/80 p-2.5 text-xs text-slate-300 border border-slate-800">
            <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Competitive cash & card rate in Singapore Money Changers / YouTrip / Trust / Revolut</span>
          </div>
        </div>

        {/* Currency Quick Converter */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-emerald-400" />
              Instant Currency Converter
            </h3>
            <span className="text-xs text-slate-400">Zero commission comparison</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Singapore Dollar (SGD S$)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-400">S$</span>
                <input
                  type="number"
                  value={inputSGD}
                  onChange={(e) => handleSgdChange(e.target.value)}
                  className="w-full bg-transparent text-xl font-bold text-white focus:outline-hidden"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {currencyRate.name} ({currencyRate.code} {currencyRate.symbol})
              </label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-emerald-400">{currencyRate.symbol}</span>
                <input
                  type="number"
                  value={inputLocal}
                  onChange={(e) => handleLocalChange(e.target.value)}
                  className="w-full bg-transparent text-xl font-bold text-emerald-400 focus:outline-hidden"
                  placeholder="Local"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400">Quick convert:</span>
            {[50, 100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => handleSgdChange(amt.toString())}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-300 hover:bg-slate-700 transition"
              >
                S${amt} (≈ {Math.round(amt * currencyRate.rateAgainstSGD).toLocaleString()} {currencyRate.code})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Overview Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Trip Budget Coordination
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <h2 className="text-3xl font-extrabold text-white">
                SGD {totalEstSGD.toLocaleString()}
              </h2>
              <span className="text-sm text-slate-400">
                estimated total ({trip.durationDays} days • {trip.numTravellers} travellers)
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Equivalent to ≈ <strong className="text-emerald-400 font-mono">{(totalEstSGD * currencyRate.rateAgainstSGD).toLocaleString()} {currencyRate.code}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-right">
              <span className="block text-[11px] text-slate-400">Per Person (SGD)</span>
              <span className="text-lg font-bold text-white">SGD {costPerPerson.toLocaleString()}</span>
            </div>

            <div className={`rounded-xl border p-3 text-right ${isOverBudget ? 'border-rose-500/40 bg-rose-950/20' : 'border-emerald-500/40 bg-emerald-950/20'}`}>
              <span className="block text-[11px] text-slate-400">Target Budget</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editableBudget}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setEditableBudget(val);
                    onUpdateBudget(val);
                  }}
                  className="w-24 bg-transparent text-right text-lg font-bold text-white focus:outline-hidden"
                />
                <span className="text-xs text-slate-400">SGD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Allocated: <strong className="text-white">SGD {totalEstSGD.toLocaleString()}</strong> of SGD {trip.baseBudgetSGD.toLocaleString()}
            </span>
            <span className={`font-semibold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isOverBudget
                ? `Exceeding budget by SGD ${Math.abs(remainingBudget).toLocaleString()}`
                : `SGD ${remainingBudget.toLocaleString()} buffer available`}
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 flex">
            {budgetItems.map((item) => (
              <div
                key={item.label}
                style={{ width: `${item.share}%` }}
                className={`${item.color} h-full transition-all`}
                title={`${item.label}: SGD ${item.sgd}`}
              />
            ))}
          </div>
        </div>

        {/* Category Breakdown Cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {budgetItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5"
            >
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${item.color} shrink-0`} />
                <div>
                  <span className="text-xs font-medium text-slate-200">{item.label}</span>
                  <span className="block text-[11px] text-slate-400">
                    ≈ {Math.round(item.sgd * currencyRate.rateAgainstSGD).toLocaleString()} {currencyRate.code}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-sm text-white">SGD {item.sgd.toLocaleString()}</span>
                <span className="block text-[11px] text-slate-400">{item.share}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

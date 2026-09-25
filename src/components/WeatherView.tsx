/**
 * Weather & Seasonality Analysis View
 */

import React, { useState } from 'react';
import { WeatherSeasonInfo, DestinationSummary } from '../types/travel';
import { CloudSun, Thermometer, Droplets, Umbrella, CheckCircle2, Calendar } from 'lucide-react';

interface WeatherViewProps {
  destination: DestinationSummary;
  weather: WeatherSeasonInfo;
}

export const WeatherView: React.FC<WeatherViewProps> = ({ destination, weather }) => {
  const [selectedMonth, setSelectedMonth] = useState('November');

  const monthlyProfiles = [
    { month: 'Jan', tempH: 10, tempL: 2, rain: 4, sun: 'High' },
    { month: 'Feb', tempH: 11, tempL: 3, rain: 5, sun: 'High' },
    { month: 'Mar', tempH: 14, tempL: 5, rain: 9, sun: 'Medium' },
    { month: 'Apr', tempH: 19, tempL: 10, rain: 10, sun: 'Cherry Blossom' },
    { month: 'May', tempH: 23, tempL: 15, rain: 10, sun: 'High' },
    { month: 'Jun', tempH: 26, tempL: 19, rain: 12, sun: 'Rainy (Tsuyu)' },
    { month: 'Jul', tempH: 30, tempL: 23, rain: 10, sun: 'Hot / Festivals' },
    { month: 'Aug', tempH: 31, tempL: 24, rain: 8, sun: 'Summer Peak' },
    { month: 'Sep', tempH: 27, tempL: 20, rain: 11, sun: 'Typhoon Season' },
    { month: 'Oct', tempH: 22, tempL: 14, rain: 8, sun: 'Mild Autumn' },
    { month: 'Nov', tempH: 17, tempL: 8, rain: 5, sun: 'Prime Autumn (Koyo)' },
    { month: 'Dec', tempH: 12, tempL: 4, rain: 4, sun: 'Crisp & Illuminations' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CloudSun className="h-6 w-6 text-amber-400" />
              <h3 className="font-bold text-xl text-white">Weather & Climate in {destination.name}</h3>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {weather.bestSeasonVerdict}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 p-3">
              <Thermometer className="h-5 w-5 text-rose-400" />
              <div>
                <span className="text-[11px] text-slate-400">Daily Range</span>
                <span className="block font-extrabold text-base text-white">
                  {weather.lowTempC}°C - {weather.highTempC}°C
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 p-3">
              <Droplets className="h-5 w-5 text-sky-400" />
              <div>
                <span className="text-[11px] text-slate-400">Rainfall Days</span>
                <span className="block font-extrabold text-base text-white">
                  ~{weather.rainfallDays} days / mo
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-950/50 p-4 border border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Current Travel Period Forecast
          </span>
          <p className="mt-1 text-sm font-medium text-white">{weather.condition}</p>
        </div>
      </div>

      {/* Seasonal Packing Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <Umbrella className="h-5 w-5 text-emerald-400" />
            <h4 className="font-semibold text-white text-base">Recommended Packing Essentials</h4>
          </div>
          <p className="text-xs text-slate-400">
            Curated wardrobe and gear recommendations for your travel window
          </p>

          <div className="space-y-2.5 pt-2">
            {weather.clothingTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
            <div className="flex items-start gap-2.5 text-xs text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Small portable umbrella & lightweight power bank for day navigation</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Slip-on footwear: many shrines, traditional restaurants and ryokans require taking shoes off</span>
            </div>
          </div>
        </div>

        {/* Monthly Climate Comparison */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-400" />
              <h4 className="font-semibold text-white text-base">Annual Temperature Profile</h4>
            </div>
            <span className="text-xs text-slate-400">High / Low (°C)</span>
          </div>

          <div className="space-y-2 pt-1">
            {monthlyProfiles.slice(0, 6).map((m) => (
              <div key={m.month} className="flex items-center justify-between text-xs">
                <span className="w-8 font-semibold text-slate-300">{m.month}</span>
                <div className="flex-1 mx-3 h-2 rounded-full bg-slate-800 overflow-hidden flex">
                  <div style={{ width: `${(m.tempH / 35) * 100}%` }} className="bg-sky-500 h-full rounded-full" />
                </div>
                <span className="w-16 text-right font-mono text-slate-300">{m.tempL}° - {m.tempH}°C</span>
              </div>
            ))}
          </div>
          <span className="block pt-2 text-[11px] text-slate-500 text-right">Source: Open-Meteo & Climate Data MCP</span>
        </div>
      </div>
    </div>
  );
};

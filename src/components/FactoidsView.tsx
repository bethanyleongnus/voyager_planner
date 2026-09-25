/**
 * Destination Factoids, Culture & Etiquette View
 */

import React from 'react';
import { DestinationFactoids, DestinationSummary } from '../types/travel';
import { Sparkles, BookOpen, AlertCircle, PhoneCall, Zap, Droplets, Volume2 } from 'lucide-react';

interface FactoidsViewProps {
  destination: DestinationSummary;
  factoids: DestinationFactoids;
}

export const FactoidsView: React.FC<FactoidsViewProps> = ({ destination, factoids }) => {
  return (
    <div className="space-y-6">
      {/* History & Tagline Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Destination Heritage & Trivia
          </span>
        </div>
        <h3 className="font-bold text-2xl text-white">{factoids.tagline}</h3>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          {factoids.historySnippet}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Power Plugs: <strong className="text-white">{factoids.plugTypes.join(' • ')}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="h-4 w-4 text-sky-400" />
            <span>Tap Water: <strong className={factoids.waterDrinkable ? 'text-emerald-400' : 'text-amber-400'}>{factoids.waterDrinkable ? 'Safe to Drink' : 'Bottled Water Advised'}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid: Etiquette & Dining Customs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cultural Etiquette */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="h-5 w-5 text-emerald-400" />
            <h4 className="font-semibold text-base">Essential Cultural Etiquette</h4>
          </div>
          <p className="text-xs text-slate-400">
            Key local customs to help you explore respectfully and naturally
          </p>

          <div className="space-y-2.5 pt-1">
            {factoids.culturalEtiquette.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300 leading-relaxed"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold">
                  {idx + 1}
                </span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dining Customs & Tipping Policy */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-4">
          <div>
            <div className="flex items-center gap-2 text-white mb-1">
              <span className="text-base">🥢</span>
              <h4 className="font-semibold text-base">Dining Customs</h4>
            </div>
            <div className="space-y-2 pt-1">
              {factoids.diningCustoms.map((custom, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300 leading-relaxed"
                >
                  {custom}
                </div>
              ))}
            </div>
          </div>

          {/* Tipping Policy Alert */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>Tipping Policy</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {factoids.tippingPolicy}
            </p>
          </div>
        </div>
      </div>

      {/* Language Cheat Sheet & Emergency Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Phrases (2 cols) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white text-base flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-sky-400" />
              Helpful Local Phrases & Pronunciation
            </h4>
            <span className="text-xs text-slate-400">Basic Conversational</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {factoids.localPhrases.map((phrase, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-400">{phrase.phrase}</span>
                  <span className="text-xs text-slate-300">{phrase.translation}</span>
                </div>
                <span className="block text-[11px] font-mono text-slate-400 italic">
                  🗣️ "{phrase.pronunciation}"
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Numbers */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white">
            <PhoneCall className="h-5 w-5 text-rose-400" />
            <h4 className="font-semibold text-base">Emergency Numbers</h4>
          </div>
          <p className="text-xs text-slate-400">Keep these handy on your phone</p>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="text-xs text-slate-300">Police Hotline</span>
              <span className="font-mono text-base font-bold text-rose-400">
                {factoids.emergencyNumbers.police}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="text-xs text-slate-300">Ambulance & Fire</span>
              <span className="font-mono text-base font-bold text-rose-400">
                {factoids.emergencyNumbers.ambulance}
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="text-xs text-slate-400">Tourist Support</span>
              <span className="font-mono text-xs font-semibold text-sky-400">
                {factoids.emergencyNumbers.touristHelp}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

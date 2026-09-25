/**
 * Visa & Travel Requirements View
 */

import React, { useState } from 'react';
import { VisaInfo, DestinationSummary } from '../types/travel';
import { ShieldAlert, CheckCircle, FileText, Smartphone, AlertTriangle, Globe } from 'lucide-react';

interface VisaViewProps {
  destination: DestinationSummary;
  visa: VisaInfo;
  onUpdatePassport?: (passport: string) => void;
}

export const VisaView: React.FC<VisaViewProps> = ({ destination, visa, onUpdatePassport }) => {
  const [selectedPassport, setSelectedPassport] = useState('Singapore (🇸🇬)');

  const passportsList = [
    'Singapore (🇸🇬)',
    'Malaysia (🇲🇾)',
    'Indonesia (🇮🇩)',
    'United Kingdom (🇬🇧)',
    'United States (🇺🇸)',
    'Australia (🇦🇺)',
  ];

  return (
    <div className="space-y-6">
      {/* Top Status Card */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
              <h3 className="font-bold text-xl text-white">Entry & Visa Status: {visa.visaType}</h3>
            </div>
            <p className="text-sm text-slate-300">
              Entering <strong className="text-white">{visa.destinationCountry}</strong> with a <strong className="text-emerald-400">{selectedPassport}</strong> passport.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-right">
              <span className="block text-[11px] text-slate-400">Max Tourist Stay</span>
              <span className="text-lg font-extrabold text-emerald-400">{visa.maxStayDays} Days</span>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-right">
              <span className="block text-[11px] text-slate-400">Passport Validity</span>
              <span className="text-lg font-extrabold text-white">{visa.passportValidityMonths}+ Months</span>
            </div>
          </div>
        </div>

        {/* Passport Selector */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            Switch Passport Nationality:
          </span>
          {passportsList.map((p) => (
            <button
              key={p}
              onClick={() => {
                setSelectedPassport(p);
                onUpdatePassport?.(p);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                selectedPassport === p
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Key Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Documents */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-sky-400" />
            <h4 className="font-semibold text-base">Mandatory Documents on Arrival</h4>
          </div>

          <div className="space-y-2 pt-1">
            {visa.requiredDocuments.map((doc, idx) => (
              <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Arrival Card / Fast Track */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white">
            <Smartphone className="h-5 w-5 text-emerald-400" />
            <h4 className="font-semibold text-base">Digital Arrival System (Fast Track)</h4>
          </div>

          {visa.electronicArrivalCardRequired ? (
            <div className="space-y-2 pt-1">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-300">
                <span className="font-bold text-white block mb-1">
                  Required: {visa.arrivalCardName}
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Complete online registration prior to airport departure. This generates an electronic QR code for fast-track immigration and customs clearance at the airport.
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Save offline screenshots of the generated QR code on your mobile phone in case airport Wi-Fi is congested.
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-300">
              No mandatory electronic pre-registration required for Singapore passport holders. Standard arrival landing cards are distributed on board or at immigration desks.
            </p>
          )}

          <div className="pt-2 text-[11px] text-slate-500">
            Source: {visa.provider}
          </div>
        </div>
      </div>
    </div>
  );
};

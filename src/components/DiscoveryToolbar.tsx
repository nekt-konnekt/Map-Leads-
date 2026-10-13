import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, X, Check } from 'lucide-react';
import { BUSINESS_CATEGORIES, POPULAR_METROS, resolveNigeriaCoordinates, NigerianMetro } from '../services/sampleData';
import { GeoScanOptions } from '../types/lead';

interface DiscoveryToolbarProps {
  onScan: (options: GeoScanOptions) => void;
  isScanning: boolean;
  onResetSample: () => void;
  activeCity: string;
}

export const DiscoveryToolbar: React.FC<DiscoveryToolbarProps> = ({
  onScan,
  isScanning,
  activeCity,
}) => {
  const [address, setAddress] = useState(activeCity || 'Ipaja, Lagos');
  const [category, setCategory] = useState('All Categories');
  const [radiusKm, setRadiusKm] = useState(5);
  const [missingWebsiteOnly, setMissingWebsiteOnly] = useState(true);

  useEffect(() => {
    if (activeCity) {
      setAddress(activeCity);
    }
  }, [activeCity]);

  const handlePresetSelect = (metro: NigerianMetro) => {
    setAddress(metro.name);
    onScan({
      address: metro.name,
      lat: metro.lat,
      lng: metro.lng,
      radiusKm,
      category,
      missingWebsiteOnly,
    });
  };

  const handleStartScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAddress = address.trim() || 'Ipaja, Lagos';

    // Intelligently resolve coordinates for Nigerian cities and districts
    const resolved = resolveNigeriaCoordinates(cleanAddress);
    const lat = resolved ? resolved.lat : 6.6074; // Default to Ipaja/Lagos rather than stale point
    const lng = resolved ? resolved.lng : 3.2758;

    onScan({
      address: cleanAddress,
      lat,
      lng,
      radiusKm,
      category,
      missingWebsiteOnly,
    });
  };

  return (
    <section className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 shadow-2xs">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Main Search Form */}
        <form onSubmit={handleStartScan} className="space-y-3">
          {/* Row 1: Search District + Category Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            {/* Search Input */}
            <div className="md:col-span-7 relative flex items-center">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 pointer-events-none shrink-0" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Search Nigerian district (e.g. Ipaja, Yaba, Ikeja, Lekki, Wuse 2, Port Harcourt)..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
              {address && (
                <button
                  type="button"
                  onClick={() => setAddress('')}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  aria-label="Clear address"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-5">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by Nigerian business category"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Radius Selector, Missing Website Toggle, & Primary Scan Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-0.5">
            {/* Filters group */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Radius Options */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs shrink-0">
                <span className="text-slate-500 font-semibold text-[11px]">Radius:</span>
                <div className="flex items-center gap-1">
                  {[1, 5, 10, 25].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRadiusKm(r)}
                      className={`min-w-[28px] py-1 px-1.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
                        radiusKm === r
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {r}km
                    </button>
                  ))}
                </div>
              </div>

              {/* No Website Only Toggle */}
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs select-none hover:bg-slate-100 transition-colors shrink-0">
                <input
                  type="checkbox"
                  checked={missingWebsiteOnly}
                  onChange={(e) => setMissingWebsiteOnly(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800 whitespace-nowrap text-[11px] sm:text-xs">
                  No Website Only (Target)
                </span>
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isScanning}
              className="min-h-[44px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 active:scale-[0.99]"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Searching Google Places...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 shrink-0" />
                  <span>Scan Nigeria Map</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Row 3: Nigerian Commercial Hub Presets (Horizontally scrollable with clean spacing) */}
        <div className="pt-1 flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
          <span className="text-slate-400 font-bold uppercase tracking-wider shrink-0 text-[10px]">
            Nigeria Hubs:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {POPULAR_METROS.map((m) => {
              const isSelected = address.toLowerCase().includes(m.name.split(',')[0].toLowerCase());
              return (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => handlePresetSelect(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title={`${m.name} (${m.tag})`}
                >
                  <span>{m.name}</span>
                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

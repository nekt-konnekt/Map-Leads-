import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { 
  Phone, Mail, Sparkles, Star, ExternalLink, ArrowRight, 
  AlertCircle, MessageSquare, List, Map as MapIcon, Search
} from 'lucide-react';
import { BusinessLead } from '../types/lead';
import { getWhatsAppUrl } from '../services/sampleData';

interface DiscoveryMapProps {
  leads: BusinessLead[];
  center: { lat: number; lng: number };
  zoom: number;
  selectedLead: BusinessLead | null;
  onSelectLead: (lead: BusinessLead) => void;
  onEnrichLead: (lead: BusinessLead) => void;
  onOpenPitch: (lead: BusinessLead) => void;
  apiKey: string;
}

export const DiscoveryMap: React.FC<DiscoveryMapProps> = ({
  leads,
  center,
  zoom,
  selectedLead,
  onSelectLead,
  onEnrichLead,
  onOpenPitch,
  apiKey,
}) => {
  const [activeMarkerLead, setActiveMarkerLead] = useState<BusinessLead | null>(selectedLead);
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');
  const [drawerQuery, setDrawerQuery] = useState('');

  useEffect(() => {
    if (selectedLead) {
      setActiveMarkerLead(selectedLead);
    }
  }, [selectedLead]);

  const filteredDrawerLeads = leads.filter((l) => {
    if (!drawerQuery.trim()) return true;
    const q = drawerQuery.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.formattedAddress.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 w-full min-h-[500px] bg-slate-100 flex flex-col md:flex-row overflow-hidden relative">
      {/* Mobile Tab Switcher */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between shrink-0 z-20">
        <span className="text-xs font-bold text-slate-800">
          {leads.length} Verified Nigerian Leads
        </span>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              mobileTab === 'map'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
          <button
            onClick={() => setMobileTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              mobileTab === 'list'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List ({leads.length})</span>
          </button>
        </div>
      </div>

      {/* Map Canvas (Always rendered on desktop; conditional on mobile) */}
      <div
        className={`flex-1 h-full relative ${
          mobileTab === 'list' ? 'hidden md:block' : 'block'
        }`}
      >
        {apiKey ? (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={center}
              center={center}
              defaultZoom={zoom}
              zoom={zoom}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              className="w-full h-full"
              gestureHandling="greedy"
              disableDefaultUI={false}
            >
              {leads.map((lead) => {
                const isNoWebsite = !lead.hasWebsite;
                const isSelected = activeMarkerLead?.id === lead.id;

                return (
                  <AdvancedMarker
                    key={lead.id}
                    position={lead.coordinates}
                    onClick={() => {
                      setActiveMarkerLead(lead);
                      onSelectLead(lead);
                    }}
                    title={`${lead.name} (${lead.city})`}
                  >
                    <Pin
                      background={isNoWebsite ? '#059669' : '#64748B'}
                      glyphColor="#FFFFFF"
                      borderColor={isSelected ? '#0F172A' : '#FFFFFF'}
                      scale={isSelected ? 1.25 : isNoWebsite ? 1.1 : 0.9}
                    />
                  </AdvancedMarker>
                );
              })}

              {activeMarkerLead && (
                <InfoWindow
                  position={activeMarkerLead.coordinates}
                  onCloseClick={() => setActiveMarkerLead(null)}
                  maxWidth={340}
                >
                  <div className="p-1 space-y-2.5 text-slate-800 text-left">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm leading-snug text-slate-900">
                          {activeMarkerLead.name}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {activeMarkerLead.category}
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-slate-700">{activeMarkerLead.city}</span>
                        </div>
                      </div>

                      {!activeMarkerLead.hasWebsite ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded shrink-0">
                          No Website
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                          Has Site
                        </span>
                      )}
                    </div>

                    {/* Address & Rating */}
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {activeMarkerLead.formattedAddress}
                    </p>

                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{activeMarkerLead.rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">
                        ({activeMarkerLead.reviewCount} Google reviews)
                      </span>
                    </div>

                    {/* Verified Contacts */}
                    <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <a
                            href={`tel:${activeMarkerLead.phone.replace(/[^0-9+]/g, '')}`}
                            className="font-mono text-blue-700 hover:underline font-bold text-xs"
                          >
                            {activeMarkerLead.phone}
                          </a>
                        </div>

                        {getWhatsAppUrl(activeMarkerLead.phone) && (
                          <a
                            href={
                              getWhatsAppUrl(
                                activeMarkerLead.phone,
                                `Good day ${activeMarkerLead.name}, I found your business in ${activeMarkerLead.city} on Google Maps...`
                              ) || '#'
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      {/* Honest Email Status */}
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        {activeMarkerLead.email ? (
                          <a
                            href={`mailto:${activeMarkerLead.email}`}
                            className="font-mono text-indigo-700 hover:underline truncate"
                          >
                            {activeMarkerLead.email}
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">
                            No email listed (WhatsApp / Call primary)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => onOpenPitch(activeMarkerLead)}
                        className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Sales Pitch</span>
                      </button>

                      <a
                        href={activeMarkerLead.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                        title="Open in Google Maps"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              Google Maps Key Required
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Please ensure your Google Maps API key is configured.
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="hidden sm:flex absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl shadow-xs px-3 py-1.5 text-xs items-center gap-3 z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="font-bold text-slate-800">No Website (Prospect)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span className="text-slate-500">Website Present</span>
          </div>
        </div>
      </div>

      {/* Side Prospect Drawer (Desktop: right panel; Mobile: when mobileTab === 'list') */}
      <div
        className={`w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-slate-200 bg-white flex flex-col h-full z-10 shadow-xs ${
          mobileTab === 'map' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              Discovered Leads ({filteredDrawerLeads.length})
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              Nigeria SME Map
            </span>
          </div>

          {/* Quick Drawer Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={drawerQuery}
              onChange={(e) => setDrawerQuery(e.target.value)}
              placeholder="Filter leads in list..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Lead Cards List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
          {filteredDrawerLeads.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {leads.length === 0
                ? 'No leads captured yet. Choose a Nigerian hub above and tap Scan Nigeria Map.'
                : 'No leads match your filter.'}
            </div>
          ) : (
            filteredDrawerLeads.map((lead) => {
              const isSelected = activeMarkerLead?.id === lead.id;
              const whatsAppUrl = getWhatsAppUrl(lead.phone);

              return (
                <div
                  key={lead.id}
                  onClick={() => {
                    setActiveMarkerLead(lead);
                    onSelectLead(lead);
                    if (mobileTab === 'list') {
                      setMobileTab('map');
                    }
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                        {lead.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {lead.category}
                      </span>
                    </div>

                    {!lead.hasWebsite ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                        No Site
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        Has Site
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                    {lead.formattedAddress}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-800">
                      <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>{lead.phone}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {whatsAppUrl && (
                        <a
                          href={whatsAppUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                          title="Open WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat</span>
                        </a>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPitch(lead);
                        }}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Pitch</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

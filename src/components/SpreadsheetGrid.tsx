import React, { useState, useMemo } from 'react';
import { 
  Search, Phone, Mail, Globe, ExternalLink, 
  Sparkles, CheckSquare, Square, Trash2, Download, Copy, Check, Star, Edit3, MessageSquare, X
} from 'lucide-react';
import { BusinessLead, PipelineStage } from '../types/lead';
import { BUSINESS_CATEGORIES, getWhatsAppUrl } from '../services/sampleData';
import { exportLeadsToCSV } from '../services/storageService';

interface SpreadsheetGridProps {
  leads: BusinessLead[];
  onUpdateLead: (lead: BusinessLead) => void;
  onDeleteLead: (leadId: string) => void;
  onBatchDelete: (leadIds: string[]) => void;
  onBatchUpdateStage: (leadIds: string[], stage: PipelineStage) => void;
  onEnrichLead: (lead: BusinessLead) => void;
  onBatchEnrich: (leads: BusinessLead[]) => void;
  onOpenPitch: (lead: BusinessLead) => void;
  isBatchEnriching?: boolean;
}

type SortField = 'name' | 'rating' | 'reviewCount' | 'pipelineStage' | 'city' | 'category';

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  leads,
  onUpdateLead,
  onDeleteLead,
  onBatchDelete,
  onBatchUpdateStage,
  onEnrichLead,
  onBatchEnrich,
  onOpenPitch,
  isBatchEnriching = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [websiteFilter, setWebsiteFilter] = useState<'all' | 'no_website' | 'has_website'>('no_website');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('reviewCount');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Filtering & Sorting
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          lead.name.toLowerCase().includes(q) ||
          lead.phone.toLowerCase().includes(q) ||
          (lead.email && lead.email.toLowerCase().includes(q)) ||
          lead.formattedAddress.toLowerCase().includes(q) ||
          lead.city.toLowerCase().includes(q) ||
          lead.category.toLowerCase().includes(q) ||
          (lead.outreachNotes && lead.outreachNotes.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && lead.category !== selectedCategory) {
        return false;
      }

      // Website filter
      if (websiteFilter === 'no_website' && lead.hasWebsite) return false;
      if (websiteFilter === 'has_website' && !lead.hasWebsite) return false;

      // Stage filter
      if (stageFilter !== 'all' && lead.pipelineStage !== stageFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'rating') {
        comparison = a.rating - b.rating;
      } else if (sortField === 'reviewCount') {
        comparison = a.reviewCount - b.reviewCount;
      } else if (sortField === 'city') {
        comparison = a.city.localeCompare(b.city);
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortField === 'pipelineStage') {
        comparison = a.pipelineStage.localeCompare(b.pipelineStage);
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [leads, searchQuery, selectedCategory, websiteFilter, stageFilter, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const startEditNote = (lead: BusinessLead) => {
    setEditingNoteId(lead.id);
    setTempNote(lead.outreachNotes || '');
  };

  const saveEditNote = (lead: BusinessLead) => {
    onUpdateLead({
      ...lead,
      outreachNotes: tempNote,
      lastUpdated: new Date().toISOString()
    });
    setEditingNoteId(null);
  };

  const handleStageChange = (lead: BusinessLead, newStage: PipelineStage) => {
    onUpdateLead({
      ...lead,
      pipelineStage: newStage,
      lastUpdated: new Date().toISOString()
    });
  };

  const selectedLeadsList = leads.filter(l => selectedIds.has(l.id));

  return (
    <div className="flex-1 w-full bg-white flex flex-col min-h-[500px]">
      {/* Control Bar: Filters & Search with responsive wrapping */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by name, phone, district, notes..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters Group */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Website filter */}
            <select
              value={websiteFilter}
              onChange={(e) => setWebsiteFilter(e.target.value as any)}
              aria-label="Filter by website presence"
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              <option value="no_website">No Website Only (Prospects)</option>
              <option value="all">All Records</option>
              <option value="has_website">Has Website Only</option>
            </select>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium max-w-[150px] truncate focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {BUSINESS_CATEGORIES.filter(c => c !== 'All Categories').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Sales Stage filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              aria-label="Filter by stage"
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Pipeline Stages</option>
              <option value="discovered">Discovered</option>
              <option value="enriched">Enriched</option>
              <option value="contacted">Contacted</option>
              <option value="meeting">Meeting</option>
              <option value="converted">Won</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Header */}
      {selectedIds.size > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold">{selectedIds.size}</span>
            <span>selected out of {filteredLeads.length} leads</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onBatchEnrich(selectedLeadsList)}
              disabled={isBatchEnriching}
              className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg font-semibold hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              Enrich Selected
            </button>

            <button
              onClick={() => exportLeadsToCSV(selectedLeadsList, 'selected_nigeria_leads.csv')}
              className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg font-semibold hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              Export CSV
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Delete ${selectedIds.size} selected leads?`)) {
                  onBatchDelete(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }
              }}
              className="px-3 py-1.5 text-red-700 hover:bg-red-100 rounded-lg font-semibold transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {filteredLeads.length === 0 ? (
          <div className="py-20 text-center text-slate-500 px-4">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs text-2xl">
                🇳🇬
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Nigeria Lead Database is Clean
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No mock or fake leads exist. Select any Nigerian commercial district (e.g. <strong>Ipaja, Lagos</strong>, <strong>Yaba, Lagos</strong>, <strong>Ikeja</strong>, <strong>Surulere</strong>, <strong>Wuse 2 Abuja</strong>) and click <strong>Scan Nigeria Map</strong> to capture real verified businesses.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View (< sm): Touch-Friendly Lead Cards */}
            <div className="block sm:hidden divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                const isSelected = selectedIds.has(lead.id);
                const whatsAppUrl = getWhatsAppUrl(lead.phone);

                return (
                  <div
                    key={lead.id}
                    className={`p-3.5 space-y-3 transition-colors ${
                      isSelected ? 'bg-emerald-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => handleToggleSelect(lead.id)}
                          className="mt-0.5 text-slate-400 p-1"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 leading-tight">
                            {lead.name}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            {lead.category}
                          </span>
                        </div>
                      </div>

                      {!lead.hasWebsite ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shrink-0">
                          No Website
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                          Has Site
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600">
                      {lead.formattedAddress}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1 text-amber-600 font-bold font-mono">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{lead.rating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">({lead.reviewCount})</span>
                      </div>

                      <select
                        value={lead.pipelineStage}
                        onChange={(e) => handleStageChange(lead, e.target.value as PipelineStage)}
                        aria-label={`Sales stage for ${lead.name}`}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border capitalize bg-white text-slate-800"
                      >
                        <option value="discovered">Discovered</option>
                        <option value="enriched">Enriched</option>
                        <option value="contacted">Contacted</option>
                        <option value="meeting">Meeting</option>
                        <option value="converted">Won</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    {/* Touch Action Bar */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                        <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <a href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`} className="hover:underline">
                          {lead.phone}
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {whatsAppUrl && (
                          <a
                            href={whatsAppUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="min-h-[34px] px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        <button
                          onClick={() => onOpenPitch(lead)}
                          className="min-h-[34px] px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Pitch</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop / Tablet Table View (sm:block) with horizontal scroll wrapper */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <button
                        onClick={handleSelectAll}
                        className="text-slate-400 hover:text-slate-600"
                        title="Select All"
                      >
                        {selectedIds.size === filteredLeads.length && filteredLeads.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>

                    <th className="p-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('name')}>
                      Business & Category
                    </th>

                    <th className="p-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('city')}>
                      Location / District
                    </th>

                    <th className="p-3 text-center">Website</th>

                    <th className="p-3">Verified Contacts</th>

                    <th className="p-3 cursor-pointer hover:bg-slate-100 text-center" onClick={() => handleSort('rating')}>
                      Rating
                    </th>

                    <th className="p-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('pipelineStage')}>
                      Sales Stage
                    </th>

                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-800 font-normal">
                  {filteredLeads.map((lead) => {
                    const isSelected = selectedIds.has(lead.id);
                    const whatsAppUrl = getWhatsAppUrl(lead.phone);

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleSelect(lead.id)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Name & Category */}
                        <td className="p-3 max-w-[220px]">
                          <div className="font-bold text-slate-900 leading-tight truncate" title={lead.name}>
                            {lead.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {lead.category}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="p-3 max-w-[200px]">
                          <div className="font-semibold text-slate-800 truncate">{lead.city}</div>
                          <div className="text-[11px] text-slate-500 truncate" title={lead.formattedAddress}>
                            {lead.formattedAddress}
                          </div>
                        </td>

                        {/* Website */}
                        <td className="p-3 text-center whitespace-nowrap">
                          {!lead.hasWebsite ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              No Website
                            </span>
                          ) : (
                            <a
                              href={lead.websiteUrl || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900"
                            >
                              <Globe className="w-3 h-3" />
                              <span>Site Listed</span>
                            </a>
                          )}
                        </td>

                        {/* Contacts (WhatsApp & Phone) */}
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                              className="font-mono font-bold text-blue-700 hover:underline flex items-center gap-1"
                              title="Click to Call"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{lead.phone}</span>
                            </a>

                            {whatsAppUrl && (
                              <a
                                href={whatsAppUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>

                          <div className="mt-1 text-[11px] text-slate-500">
                            {lead.email ? (
                              <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline truncate">
                                {lead.email}
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">No email (Direct Phone)</span>
                            )}
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 font-mono font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{lead.rating.toFixed(1)}</span>
                            <span className="text-slate-400 font-normal">({lead.reviewCount})</span>
                          </div>
                        </td>

                        {/* Stage */}
                        <td className="p-3 whitespace-nowrap">
                          <select
                            value={lead.pipelineStage}
                            onChange={(e) => handleStageChange(lead, e.target.value as PipelineStage)}
                            aria-label={`Sales stage for ${lead.name}`}
                            className="text-xs font-semibold px-2 py-1 rounded-lg border capitalize bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="discovered">Discovered</option>
                            <option value="enriched">Enriched</option>
                            <option value="contacted">Contacted</option>
                            <option value="meeting">Meeting</option>
                            <option value="converted">Won</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenPitch(lead)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Generate Pitch"
                            >
                              <Sparkles className="w-3 h-3 text-amber-300" />
                              <span>Pitch</span>
                            </button>

                            <a
                              href={lead.googleMapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                              title="View on Google Maps"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => onDeleteLead(lead.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

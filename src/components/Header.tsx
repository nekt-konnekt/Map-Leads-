import React, { useState } from 'react';
import { 
  MapPin, Table2, Kanban, Download, Plus, Sparkles, 
  Building2, Phone, Globe, Menu, X, Trash2, CheckCircle2
} from 'lucide-react';
import { BusinessLead } from '../types/lead';
import { exportLeadsToCSV } from '../services/storageService';

interface HeaderProps {
  currentView: 'spreadsheet' | 'map' | 'kanban';
  onViewChange: (view: 'spreadsheet' | 'map' | 'kanban') => void;
  leads: BusinessLead[];
  onOpenAddModal: () => void;
  onClearDatabase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  leads,
  onOpenAddModal,
  onClearDatabase,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalLeads = leads.length;
  const noWebsiteLeads = leads.filter(l => !l.hasWebsite).length;
  const noWebsitePct = totalLeads > 0 ? Math.round((noWebsiteLeads / totalLeads) * 100) : 0;
  const withPhone = leads.filter(l => l.phone && l.phone !== 'No phone listed').length;
  const converted = leads.filter(l => l.pipelineStage === 'converted').length;

  const handleSelectNav = (view: 'spreadsheet' | 'map' | 'kanban') => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-2xs">
        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-xs shrink-0 select-none">
              🇳🇬
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-tight">
                MapLeads Nigeria
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold tracking-wide hidden sm:inline">
                Verified No-Website SME Prospector
              </span>
            </div>
          </div>

          {/* Desktop View Switcher (lg+) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => handleSelectNav('spreadsheet')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentView === 'spreadsheet'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Spreadsheet Database</span>
            </button>
            <button
              onClick={() => handleSelectNav('map')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentView === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Nigeria Map</span>
            </button>
            <button
              onClick={() => handleSelectNav('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentView === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Pipeline Kanban</span>
            </button>
          </nav>

          {/* Desktop Actions (lg+) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {totalLeads > 0 && (
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {totalLeads} {totalLeads === 1 ? 'Lead' : 'Leads'}
              </span>
            )}

            <button
              onClick={() => exportLeadsToCSV(leads, 'nigeria_leads.csv')}
              disabled={leads.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap"
              title="Download CSV database"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lead</span>
            </button>
          </div>

          {/* Tablet & Mobile Hamburger Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            {totalLeads > 0 && (
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                {totalLeads} Leads
              </span>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-800" />
              ) : (
                <Menu className="w-6 h-6 text-slate-800" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Metric Strip */}
        <div className="hidden sm:block border-t border-slate-100 bg-slate-50/70 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Total Leads:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">{totalLeads}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Missing Website:</span>
                <span className="font-mono tabular-nums font-semibold text-emerald-700">
                  {noWebsiteLeads} ({noWebsitePct}%)
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>WhatsApp / Phone:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">{withPhone}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Deals Won:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">{converted}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Hamburger Drawer with Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content (slides from right) */}
          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Top */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇳🇬</span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">MapLeads Nigeria</h3>
                  <span className="text-[11px] text-emerald-700 font-medium">Navigation & Actions</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Views section */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                  Select Workspace View
                </span>
                <div className="space-y-2">
                  <button
                    onClick={() => handleSelectNav('spreadsheet')}
                    className={`w-full min-h-[48px] px-3.5 py-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      currentView === 'spreadsheet'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Table2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Spreadsheet Database</div>
                        <div className="text-[10px] text-slate-500 font-normal">Search, filter & bulk outreach</div>
                      </div>
                    </div>
                    {currentView === 'spreadsheet' && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>

                  <button
                    onClick={() => handleSelectNav('map')}
                    className={`w-full min-h-[48px] px-3.5 py-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      currentView === 'map'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Nigeria Map Discovery</div>
                        <div className="text-[10px] text-slate-500 font-normal">Pinpoint businesses by district</div>
                      </div>
                    </div>
                    {currentView === 'map' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>

                  <button
                    onClick={() => handleSelectNav('kanban')}
                    className={`w-full min-h-[48px] px-3.5 py-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      currentView === 'kanban'
                        ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Kanban className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Pipeline Kanban</div>
                        <div className="text-[10px] text-slate-500 font-normal">Manage deals from contact to won</div>
                      </div>
                    </div>
                    {currentView === 'kanban' && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                  Lead Management
                </span>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onOpenAddModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Add Lead Manually</span>
                  </button>

                  <button
                    onClick={() => {
                      exportLeadsToCSV(leads, 'nigeria_leads.csv');
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={leads.length === 0}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Export Leads to CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Clear all leads in the database? This cannot be undone.')) {
                        onClearDatabase();
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-transparent hover:border-red-200"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span>Clear Lead Database</span>
                  </button>
                </div>
              </div>

              {/* Live KPI statistics */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                  Nigeria Database Stats
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Total Discovered</span>
                    <span className="text-base font-mono font-bold text-slate-900">{totalLeads}</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <span className="text-[10px] text-emerald-700 block">No Website</span>
                    <span className="text-base font-mono font-bold text-emerald-800">{noWebsiteLeads}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
                    <span className="text-[10px] text-blue-700 block">WhatsApp / Phone</span>
                    <span className="text-base font-mono font-bold text-blue-800">{withPhone}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                    <span className="text-[10px] text-amber-700 block">Deals Won</span>
                    <span className="text-base font-mono font-bold text-amber-800">{converted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

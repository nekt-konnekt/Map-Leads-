import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DiscoveryToolbar } from './components/DiscoveryToolbar';
import { DiscoveryMap } from './components/DiscoveryMap';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { KanbanBoard } from './components/KanbanBoard';
import { PitchModal } from './components/PitchModal';
import { AddLeadModal } from './components/AddLeadModal';
import { BusinessLead, GeoScanOptions, PipelineStage } from './types/lead';
import { loadStoredLeads, saveStoredLeads, clearAllStoredLeads } from './services/storageService';
import { searchRealPlaces } from './services/mapScanner';
import { enrichLeadContact } from './services/enrichmentService';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [currentView, setCurrentView] = useState<'spreadsheet' | 'map' | 'kanban'>('spreadsheet');
  const [activeCity, setActiveCity] = useState('Ipaja, Lagos');
  const [mapCenter, setMapCenter] = useState({ lat: 6.6074, lng: 3.2758 }); // Ipaja, Lagos
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [pitchLead, setPitchLead] = useState<BusinessLead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isBatchEnriching, setIsBatchEnriching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Load stored leads on mount
  useEffect(() => {
    const stored = loadStoredLeads();
    setLeads(stored);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update lead and persist
  const handleUpdateLead = (updated: BusinessLead) => {
    setLeads((prev) => {
      const next = prev.map((l) => (l.id === updated.id ? updated : l));
      saveStoredLeads(next);
      return next;
    });
  };

  // Delete lead
  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => {
      const next = prev.filter((l) => l.id !== leadId);
      saveStoredLeads(next);
      return next;
    });
    showToast('Lead removed from database');
  };

  // Batch delete
  const handleBatchDelete = (leadIds: string[]) => {
    const idSet = new Set(leadIds);
    setLeads((prev) => {
      const next = prev.filter((l) => !idSet.has(l.id));
      saveStoredLeads(next);
      return next;
    });
    showToast(`Removed ${leadIds.length} leads`);
  };

  // Batch stage update
  const handleBatchUpdateStage = (leadIds: string[], stage: PipelineStage) => {
    const idSet = new Set(leadIds);
    setLeads((prev) => {
      const next = prev.map((l) =>
        idSet.has(l.id) ? { ...l, pipelineStage: stage, lastUpdated: new Date().toISOString() } : l
      );
      saveStoredLeads(next);
      return next;
    });
    showToast(`Updated ${leadIds.length} leads to stage "${stage}"`);
  };

  // Add lead manually
  const handleAddLead = (newLead: BusinessLead) => {
    setLeads((prev) => {
      const next = [newLead, ...prev];
      saveStoredLeads(next);
      return next;
    });
    showToast(`Added "${newLead.name}" to database`);
  };

  // Clear all leads
  const handleClearAllLeads = () => {
    clearAllStoredLeads();
    setLeads([]);
    showToast('All leads cleared. Database is clean.');
  };

  // Scan boundary area with real Google Places API and precise Geocoding
  const handleScan = async (options: GeoScanOptions) => {
    setIsScanning(true);
    setActiveCity(options.address);
    setMapCenter({ lat: options.lat, lng: options.lng });
    setMapZoom(options.radiusKm <= 3 ? 14 : options.radiusKm <= 10 ? 13 : 11);

    try {
      showToast(`Searching Google Places in ${options.address}...`);
      const { leads: discovered, center: geocodedCenter, resolvedAddress } = await searchRealPlaces(options);

      // Align map center directly with the exact coordinates of the resolved location
      if (geocodedCenter) {
        setMapCenter(geocodedCenter);
      }
      if (resolvedAddress) {
        setActiveCity(resolvedAddress.split(',')[0]);
      }

      if (discovered.length === 0) {
        showToast(`No businesses without a website found matching "${options.category}" in ${options.address}.`);
        return;
      }

      setLeads((prev) => {
        // Prevent duplicate placeIds
        const existingPlaceIds = new Set(prev.map((p) => p.placeId));
        const newUnique = discovered.filter((d) => !existingPlaceIds.has(d.placeId));
        const next = [...newUnique, ...prev];
        saveStoredLeads(next);
        return next;
      });

      showToast(`Found ${discovered.length} verified businesses without website in ${options.address}!`);
    } catch (error: any) {
      console.error('Places search error:', error);
      showToast(`Search error: ${error.message || 'Failed to query Google Places'}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Single lead enrichment
  const handleEnrichLead = async (lead: BusinessLead) => {
    showToast(`Enriching contact info for ${lead.name}...`);
    try {
      const result = await enrichLeadContact(lead);
      const updated: BusinessLead = {
        ...lead,
        email: result.email || lead.email,
        alternatePhone: result.alternatePhone || lead.alternatePhone,
        ownerOrContact: result.ownerOrContact || lead.ownerOrContact,
        pitchAngle: result.pitchAngle || lead.pitchAngle,
        emailEnrichmentStatus: result.confidence === 'not_found' ? 'not_found' : 'verified',
        pipelineStage: lead.pipelineStage === 'discovered' ? 'enriched' : lead.pipelineStage,
        lastUpdated: new Date().toISOString(),
      };
      handleUpdateLead(updated);
      showToast(result.email ? `Found verified email: ${result.email}` : 'Verified via Google Maps & WhatsApp');
    } catch (e) {
      console.error(e);
      showToast('Enrichment failed');
    }
  };

  // Batch lead enrichment
  const handleBatchEnrich = async (leadsToEnrich: BusinessLead[]) => {
    setIsBatchEnriching(true);
    showToast(`Starting contact enrichment for ${leadsToEnrich.length} leads...`);

    let enrichedCount = 0;
    for (const lead of leadsToEnrich) {
      try {
        const result = await enrichLeadContact(lead);
        const updated: BusinessLead = {
          ...lead,
          email: result.email || lead.email,
          alternatePhone: result.alternatePhone || lead.alternatePhone,
          ownerOrContact: result.ownerOrContact || lead.ownerOrContact,
          pitchAngle: result.pitchAngle || lead.pitchAngle,
          emailEnrichmentStatus: result.confidence === 'not_found' ? 'not_found' : 'verified',
          pipelineStage: lead.pipelineStage === 'discovered' ? 'enriched' : lead.pipelineStage,
          lastUpdated: new Date().toISOString(),
        };
        handleUpdateLead(updated);
        enrichedCount++;
      } catch (err) {
        console.warn(`Failed enriching ${lead.name}:`, err);
      }
    }

    setIsBatchEnriching(false);
    showToast(`Enrichment complete! Updated ${enrichedCount} leads.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Header with Responsive Hamburger Drawer */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        leads={leads}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onClearDatabase={handleClearAllLeads}
      />

      {/* Discovery Toolbar */}
      <DiscoveryToolbar
        onScan={handleScan}
        isScanning={isScanning}
        onResetSample={handleClearAllLeads}
        activeCity={activeCity}
      />

      {/* Main Workspace View */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'map' && (
          <DiscoveryMap
            leads={leads}
            center={mapCenter}
            zoom={mapZoom}
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
            onEnrichLead={handleEnrichLead}
            onOpenPitch={(l) => setPitchLead(l)}
            apiKey={apiKey}
          />
        )}

        {currentView === 'spreadsheet' && (
          <SpreadsheetGrid
            leads={leads}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            onBatchDelete={handleBatchDelete}
            onBatchUpdateStage={handleBatchUpdateStage}
            onEnrichLead={handleEnrichLead}
            onBatchEnrich={handleBatchEnrich}
            onOpenPitch={(l) => setPitchLead(l)}
            isBatchEnriching={isBatchEnriching}
          />
        )}

        {currentView === 'kanban' && (
          <KanbanBoard
            leads={leads}
            onUpdateLead={handleUpdateLead}
            onOpenPitch={(l) => setPitchLead(l)}
            onEnrichLead={handleEnrichLead}
          />
        )}
      </main>

      {/* Outreach Pitch Modal */}
      <PitchModal
        lead={pitchLead}
        isOpen={Boolean(pitchLead)}
        onClose={() => setPitchLead(null)}
        onLeadContacted={(lead) => {
          handleUpdateLead({
            ...lead,
            pipelineStage: 'contacted',
            lastUpdated: new Date().toISOString(),
          });
          setPitchLead(null);
          showToast(`Marked ${lead.name} as Contacted!`);
        }}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLead={handleAddLead}
      />
    </div>
  );
}

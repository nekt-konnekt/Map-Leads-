import React from 'react';
import { 
  Phone, Mail, Star, Sparkles, ChevronRight, ChevronLeft, 
  ExternalLink, MessageSquare
} from 'lucide-react';
import { BusinessLead, PipelineStage } from '../types/lead';
import { getWhatsAppUrl } from '../services/sampleData';

interface KanbanBoardProps {
  leads: BusinessLead[];
  onUpdateLead: (lead: BusinessLead) => void;
  onOpenPitch: (lead: BusinessLead) => void;
  onEnrichLead: (lead: BusinessLead) => void;
}

interface ColumnConfig {
  stage: PipelineStage;
  title: string;
  badgeColor: string;
  headerBg: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    stage: 'discovered',
    title: 'Discovered (No Site)',
    badgeColor: 'text-amber-700 bg-amber-100',
    headerBg: 'bg-amber-50/80'
  },
  {
    stage: 'enriched',
    title: 'Enriched & Verified',
    badgeColor: 'text-indigo-700 bg-indigo-100',
    headerBg: 'bg-indigo-50/80'
  },
  {
    stage: 'contacted',
    title: 'WhatsApp / Call Sent',
    badgeColor: 'text-purple-700 bg-purple-100',
    headerBg: 'bg-purple-50/80'
  },
  {
    stage: 'meeting',
    title: 'Meeting / Demo Scheduled',
    badgeColor: 'text-blue-700 bg-blue-100',
    headerBg: 'bg-blue-50/80'
  },
  {
    stage: 'converted',
    title: 'Client Won 🎉',
    badgeColor: 'text-emerald-700 bg-emerald-100',
    headerBg: 'bg-emerald-50/80'
  },
  {
    stage: 'archived',
    title: 'Archived / Cold',
    badgeColor: 'text-slate-600 bg-slate-200',
    headerBg: 'bg-slate-100/80'
  }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onUpdateLead,
  onOpenPitch,
  onEnrichLead,
}) => {
  const stageOrder: PipelineStage[] = ['discovered', 'enriched', 'contacted', 'meeting', 'converted', 'archived'];

  const moveLeadStage = (lead: BusinessLead, direction: 'prev' | 'next') => {
    const currentIndex = stageOrder.indexOf(lead.pipelineStage);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= stageOrder.length) return;

    onUpdateLead({
      ...lead,
      pipelineStage: stageOrder[nextIndex],
      lastUpdated: new Date().toISOString()
    });
  };

  return (
    <div className="flex-1 w-full bg-slate-100/70 p-3 sm:p-5 overflow-x-auto flex gap-4 min-h-[500px]">
      {COLUMNS.map((col) => {
        const columnLeads = leads.filter(l => l.pipelineStage === col.stage);
        const stageIndex = stageOrder.indexOf(col.stage);

        return (
          <div
            key={col.stage}
            className="w-72 sm:w-80 shrink-0 bg-white border border-slate-200 rounded-2xl flex flex-col h-full shadow-2xs"
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b border-slate-200 rounded-t-2xl ${col.headerBg} flex items-center justify-between`}>
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                {col.title}
              </h3>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${col.badgeColor}`}>
                {columnLeads.length}
              </span>
            </div>

            {/* Leads Column Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {columnLeads.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs italic">
                  No prospects in this stage
                </div>
              ) : (
                columnLeads.map((lead) => {
                  const whatsAppUrl = getWhatsAppUrl(lead.phone);

                  return (
                    <div
                      key={lead.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5"
                    >
                      {/* Top info */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
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

                      {/* Address & rating */}
                      <div className="text-[11px] text-slate-600 line-clamp-1">
                        {lead.formattedAddress}
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-1 text-amber-600 font-mono">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{lead.rating.toFixed(1)}</span>
                          <span className="text-slate-400 font-normal">({lead.reviewCount})</span>
                        </div>

                        <span className="text-[11px] text-slate-500 font-medium">
                          {lead.city}
                        </span>
                      </div>

                      {/* Phone & WhatsApp */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <a
                          href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                          className="font-mono text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 truncate"
                        >
                          <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">{lead.phone}</span>
                        </a>

                        {whatsAppUrl && (
                          <a
                            href={whatsAppUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs shrink-0"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      {/* Bottom action row: Pitch and Stage Navigation */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <button
                          onClick={() => onOpenPitch(lead)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Pitch</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {stageIndex > 0 && (
                            <button
                              onClick={() => moveLeadStage(lead, 'prev')}
                              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                              title="Move to previous stage"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                          )}

                          {stageIndex < stageOrder.length - 1 && (
                            <button
                              onClick={() => moveLeadStage(lead, 'next')}
                              className="p-1.5 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 font-bold"
                              title="Advance to next stage"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

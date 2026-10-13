import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, Mail, Phone, ExternalLink, RefreshCw, MessageSquare } from 'lucide-react';
import { BusinessLead } from '../types/lead';
import { generateLeadPitch } from '../services/enrichmentService';
import { getWhatsAppUrl } from '../services/sampleData';

interface PitchModalProps {
  lead: BusinessLead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadContacted: (lead: BusinessLead) => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({
  lead,
  isOpen,
  onClose,
  onLeadContacted,
}) => {
  const [pitchType, setPitchType] = useState<'friendly_audit' | 'missed_revenue' | 'competitor_contrast' | 'quick_call'>('friendly_audit');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (lead && isOpen) {
      loadPitch();
    }
  }, [lead, isOpen, pitchType]);

  const loadPitch = async () => {
    if (!lead) return;
    setIsGenerating(true);
    try {
      const result = await generateLeadPitch(lead, pitchType);
      setSubject(result.subject);
      setBody(result.body);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen || !lead) return null;

  const handleCopy = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEmail = () => {
    const recipient = lead.email || '';
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    onLeadContacted(lead);
  };

  const handleOpenWhatsApp = () => {
    const waUrl = getWhatsAppUrl(lead.phone, body);
    if (waUrl) {
      window.open(waUrl, '_blank');
      onLeadContacted(lead);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">
                Outreach Pitch Generator
              </h3>
              <p className="text-xs text-slate-500">
                Tailored for <span className="font-semibold text-slate-700">{lead.name}</span> (No Website)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Pitch Strategy Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Outreach Strategy:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'friendly_audit', label: 'Friendly Audit' },
                { id: 'missed_revenue', label: 'Missed Calls / ROI' },
                { id: 'competitor_contrast', label: 'Local Search Lead' },
                { id: 'quick_call', label: 'Fast 15-Min Demo' }
              ].map((strategy) => (
                <button
                  key={strategy.id}
                  type="button"
                  onClick={() => setPitchType(strategy.id as any)}
                  className={`px-3 py-2 rounded-lg border text-left font-medium transition-colors ${
                    pitchType === strategy.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {strategy.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Contact Bar */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Phone:</span>
              <a
                href={`tel:${lead.phone.replace(/[^0-9]/g, '')}`}
                className="font-mono text-blue-700 font-semibold hover:underline"
              >
                {lead.phone}
              </a>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>Email:</span>
              <span className="font-mono font-semibold text-indigo-700">
                {lead.email || 'None (call directly)'}
              </span>
            </div>

            <a
              href={lead.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <span>View Maps Listing</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Line:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Email Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Email Message Body:
              </label>
              <button
                type="button"
                onClick={loadPitch}
                disabled={isGenerating}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate with AI</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:px-5 sm:py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="order-last sm:order-first py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 text-center"
          >
            Close
          </button>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Pitch</span>
                </>
              )}
            </button>

            {getWhatsAppUrl(lead.phone) && (
              <button
                onClick={handleOpenWhatsApp}
                className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </button>
            )}

            <button
              onClick={handleOpenEmail}
              className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

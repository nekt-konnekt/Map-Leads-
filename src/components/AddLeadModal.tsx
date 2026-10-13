import React, { useState } from 'react';
import { X, Plus, Building2, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { BusinessLead } from '../types/lead';
import { BUSINESS_CATEGORIES } from '../services/sampleData';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: BusinessLead) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onAddLead,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(BUSINESS_CATEGORIES[1]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lagos, Nigeria');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hasWebsite, setHasWebsite] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newLead: BusinessLead = {
      id: `lead-manual-${Date.now()}`,
      placeId: `manual-${Date.now()}`,
      name: name.trim(),
      category,
      formattedAddress: address.trim() || `${name.trim()}, ${city}`,
      city,
      phone: phone.trim() || 'No phone listed',
      email: email.trim() || null,
      hasWebsite,
      websiteUrl: null,
      rating: 4.5,
      reviewCount: 15,
      coordinates: { lat: 6.5095, lng: 3.3711 },
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(name + ' ' + city)}`,
      pipelineStage: 'discovered',
      outreachNotes: notes.trim() || 'Manually added lead. Missing website.',
      emailEnrichmentStatus: email.trim() ? 'verified' : 'pending',
      pitchAngle: `Help ${name} gain online visibility and direct quote inquiries in ${city}.`,
      lastUpdated: new Date().toISOString()
    };

    onAddLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-sm text-slate-900">Add New Prospect Lead</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Business Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Plumbing & Repair"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
              >
                {BUSINESS_CATEGORIES.filter(c => c !== 'All Categories').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Austin, TX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(512) 555-0199"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@business.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Austin, TX"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasWebsite}
                onChange={(e) => setHasWebsite(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300"
              />
              <span className="text-slate-700">Has an active website already</span>
            </label>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Outreach Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Great 4.8 star ratings, owner works on site..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
            >
              Add to Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

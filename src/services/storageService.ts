import { BusinessLead } from '../types/lead';

// Updated storage key for 100% verified real Google Places data
const STORAGE_KEY = 'mapleads_real_places_v3';

export const loadStoredLeads = (): BusinessLead[] => {
  try {
    // Clear old simulated keys so fake data is wiped
    localStorage.removeItem('mapleads_database_records_v1');
    localStorage.removeItem('mapleads_africa_database_v2');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to load leads from localStorage:', error);
    return [];
  }
};

export const saveStoredLeads = (leads: BusinessLead[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (error) {
    console.error('Failed to save leads to localStorage:', error);
  }
};

export const clearAllStoredLeads = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('mapleads_africa_database_v2');
    localStorage.removeItem('mapleads_database_records_v1');
  } catch (error) {
    console.error('Failed to clear leads:', error);
  }
};

export const exportLeadsToCSV = (leads: BusinessLead[], filename = 'africa_business_leads.csv'): void => {
  const headers = [
    'Business Name',
    'Category',
    'Has Website',
    'Website URL',
    'Primary Phone',
    'Alternate Phone',
    'Contact Email',
    'Email Status',
    'Address',
    'City / Region',
    'Rating',
    'Review Count',
    'Pipeline Stage',
    'Owner / Contact',
    'Pitch Angle',
    'Outreach Notes',
    'WhatsApp Link',
    'Google Maps URL',
    'Last Updated'
  ];

  const escapeCSV = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined) return '""';
    const stringVal = String(value).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const rows = leads.map(l => {
    const rawDigits = (l.phone || '').replace(/\D/g, '');
    const waLink = rawDigits ? `https://wa.me/${rawDigits.startsWith('0') ? '234' + rawDigits.slice(1) : rawDigits}` : '';

    return [
      escapeCSV(l.name),
      escapeCSV(l.category),
      escapeCSV(l.hasWebsite ? 'YES' : 'NO (Missing)'),
      escapeCSV(l.websiteUrl || ''),
      escapeCSV(l.phone),
      escapeCSV(l.alternatePhone || ''),
      escapeCSV(l.email || ''),
      escapeCSV(l.emailEnrichmentStatus),
      escapeCSV(l.formattedAddress),
      escapeCSV(l.city),
      escapeCSV(l.rating),
      escapeCSV(l.reviewCount),
      escapeCSV(l.pipelineStage),
      escapeCSV(l.ownerOrContact || ''),
      escapeCSV(l.pitchAngle || ''),
      escapeCSV(l.outreachNotes),
      escapeCSV(waLink),
      escapeCSV(l.googleMapsUrl),
      escapeCSV(l.lastUpdated)
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportLeadsToJSON = (leads: BusinessLead[], filename = 'africa_business_leads.json'): void => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(leads, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

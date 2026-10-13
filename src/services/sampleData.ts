import { BusinessLead } from '../types/lead';

// All mock leads cleared as requested - database starts clean
export const INITIAL_SAMPLE_LEADS: BusinessLead[] = [];

export interface NigerianMetro {
  name: string;
  state: string;
  lat: number;
  lng: number;
  tag: string;
}

export const POPULAR_METROS: NigerianMetro[] = [
  { name: 'Ipaja, Lagos', state: 'Lagos', lat: 6.6074, lng: 3.2758, tag: 'Commercial & Residential' },
  { name: 'Yaba, Lagos', state: 'Lagos', lat: 6.5095, lng: 3.3711, tag: 'Tech & Trade District' },
  { name: 'Ikeja, Lagos', state: 'Lagos', lat: 6.6018, lng: 3.3515, tag: 'Capital & Computer Village' },
  { name: 'Lekki Phase 1, Lagos', state: 'Lagos', lat: 6.4474, lng: 3.4756, tag: 'Commercial Island' },
  { name: 'Victoria Island, Lagos', state: 'Lagos', lat: 6.4281, lng: 3.4219, tag: 'Business District' },
  { name: 'Surulere, Lagos', state: 'Lagos', lat: 6.4984, lng: 3.3578, tag: 'Urban Commercial' },
  { name: 'Alaba International, Lagos', state: 'Lagos', lat: 6.4589, lng: 3.1972, tag: 'Electronics & Retail' },
  { name: 'Festac Town, Lagos', state: 'Lagos', lat: 6.4678, lng: 3.2844, tag: 'Wholesale & Retail' },
  { name: 'Wuse 2, Abuja', state: 'Abuja FCT', lat: 9.0765, lng: 7.4646, tag: 'Commercial Hub' },
  { name: 'Garki, Abuja', state: 'Abuja FCT', lat: 9.0275, lng: 7.4912, tag: 'Commerce & Services' },
  { name: 'Maitama, Abuja', state: 'Abuja FCT', lat: 9.0882, lng: 7.4934, tag: 'Services & Diplomatic' },
  { name: 'Port Harcourt, Rivers', state: 'Rivers', lat: 4.8156, lng: 7.0498, tag: 'Oil & Trade Hub' },
  { name: 'Bodija, Ibadan', state: 'Oyo', lat: 7.4333, lng: 3.9000, tag: 'Markets & Commerce' },
  { name: 'Dugbe, Ibadan', state: 'Oyo', lat: 7.3912, lng: 3.8763, tag: 'CBD & Wholesale' },
  { name: 'Kano Central, Kano', state: 'Kano', lat: 12.0022, lng: 8.5920, tag: 'Northern Trade Center' },
  { name: 'Onitsha Main Market, Anambra', state: 'Anambra', lat: 6.1498, lng: 6.7856, tag: 'Commercial Giant' },
  { name: 'Enugu (Independence Layout)', state: 'Enugu', lat: 6.4584, lng: 7.5464, tag: 'Eastern Hub' },
  { name: 'Benin City, Edo', state: 'Edo', lat: 6.3350, lng: 5.6037, tag: 'Commercial Trade' },
  { name: 'Abeokuta, Ogun', state: 'Ogun', lat: 7.1557, lng: 3.3451, tag: 'Industrial Corridor' }
];

export const BUSINESS_CATEGORIES = [
  'All Categories',
  'Fashion & Bespoke Tailoring',
  'Logistics & Dispatch Services',
  'Event Centers & Catering',
  'Auto Repair & Mechanics',
  'Real Estate & Shortlets',
  'Private Schools & Academies',
  'Clinics & Pharmacies',
  'Supermarkets & Wholesalers',
  'Restaurants, Lounges & Grills',
  'Beauty Salons & Barbershops',
  'Solar & Electrical Contractors',
  'Furniture & Interior Design'
];

/**
 * Resolves a searched Nigerian location query to exact known latitude and longitude
 */
export const resolveNigeriaCoordinates = (query: string): { lat: number; lng: number; name: string } | null => {
  if (!query) return null;
  const clean = query.trim().toLowerCase();

  // Direct match in POPULAR_METROS
  const directMatch = POPULAR_METROS.find(
    (m) => m.name.toLowerCase() === clean || m.name.toLowerCase().startsWith(clean)
  );
  if (directMatch) {
    return { lat: directMatch.lat, lng: directMatch.lng, name: directMatch.name };
  }

  // Substring search (e.g. searching "ipaja" matches "Ipaja, Lagos")
  const partial = POPULAR_METROS.find((m) =>
    m.name.toLowerCase().includes(clean) || clean.includes(m.name.split(',')[0].toLowerCase())
  );
  if (partial) {
    return { lat: partial.lat, lng: partial.lng, name: partial.name };
  }

  return null;
};

/**
 * Formats a local Nigerian phone number into standard international WhatsApp E.164 format
 */
export const formatWhatsAppNumber = (rawPhone: string): string | null => {
  if (!rawPhone || rawPhone === 'No phone listed') return null;
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return null;

  // Nigerian 11-digit local mobile starting with 0 (e.g. 0803..., 081..., 090..., 070..., 091...)
  if (digits.length === 11 && digits.startsWith('0')) {
    return `234${digits.slice(1)}`;
  }
  // Nigerian 10-digit without leading 0
  if (digits.length === 10 && (digits.startsWith('80') || digits.startsWith('81') || digits.startsWith('90') || digits.startsWith('70') || digits.startsWith('91'))) {
    return `234${digits}`;
  }
  // If already prefixed with 234
  if (digits.startsWith('234') && digits.length >= 13) {
    return digits;
  }
  if (digits.startsWith('234') && digits.length === 13) {
    return digits;
  }

  return digits;
};

export const getWhatsAppUrl = (rawPhone: string, message?: string): string | null => {
  const clean = formatWhatsAppNumber(rawPhone);
  if (!clean) return null;
  return `https://wa.me/${clean}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
};

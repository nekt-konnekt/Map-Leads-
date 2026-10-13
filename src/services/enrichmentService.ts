import { BusinessLead } from '../types/lead';

export interface EnrichmentResult {
  email: string | null;
  alternatePhone?: string | null;
  ownerOrContact?: string | null;
  confidence: 'verified' | 'inferred' | 'not_found' | 'low';
  source: string;
  pitchAngle: string;
}

export const enrichLeadContact = async (lead: BusinessLead): Promise<EnrichmentResult> => {
  try {
    const response = await fetch('/api/enrich-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: lead.name,
        category: lead.category,
        formattedAddress: lead.formattedAddress,
        phone: lead.phone,
        city: lead.city
      }),
    });

    if (!response.ok) {
      throw new Error(`Enrichment server responded with ${response.status}`);
    }

    const data = await response.json();
    return {
      email: data.email || null,
      alternatePhone: data.alternatePhone || null,
      ownerOrContact: data.ownerOrContact || null,
      confidence: data.confidence || 'inferred',
      source: data.source || 'AI Intelligence',
      pitchAngle: data.pitchAngle || `Launch a mobile-optimized storefront for ${lead.name} to capture local customer calls.`
    };
  } catch (error) {
    console.warn('API enrichment error:', error);
    return {
      email: null,
      alternatePhone: null,
      ownerOrContact: null,
      confidence: 'not_found',
      source: 'Google Maps Business Profile',
      pitchAngle: `Help ${lead.name} stop losing online leads in ${lead.city} by launching a mobile website with direct WhatsApp ordering.`
    };
  }
};

export const generateLeadPitch = async (
  lead: BusinessLead, 
  pitchType: 'friendly_audit' | 'missed_revenue' | 'competitor_contrast' | 'quick_call' = 'friendly_audit'
): Promise<{ subject: string; body: string }> => {
  try {
    const response = await fetch('/api/generate-pitch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead, pitchType }),
    });

    if (!response.ok) {
      throw new Error(`Pitch server responded with ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Fallback pitch generator engaged:', error);
    const category = lead.category || 'business';
    const location = lead.city || 'your area';

    return {
      subject: `Inquiry regarding ${lead.name}'s web presence in ${location}`,
      body: `Good day ${lead.name} team,\n\nI was looking up verified ${category.toLowerCase()} providers in ${location} and noticed your Google profile has good ratings, but no official website or digital catalog linked.\n\nMany customers search Google on mobile and prefer viewing your service list and booking online without having to wait for replies. A modern 1-page mobile site with your direct WhatsApp button will help you convert more local and diaspora customers into paying clients.\n\nI have put together a quick mockup for ${lead.name}. Can I send you a 2-minute video walkthrough?\n\nWarm regards,\nDigital Growth Consultant`
    };
  }
};

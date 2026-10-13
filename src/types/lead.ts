export type PipelineStage = 
  | 'discovered' 
  | 'enriched' 
  | 'contacted' 
  | 'meeting' 
  | 'converted' 
  | 'archived';

export type EnrichmentStatus = 
  | 'verified' 
  | 'inferred' 
  | 'not_found' 
  | 'pending';

export interface BusinessLead {
  id: string;
  placeId: string;
  name: string;
  category: string;
  formattedAddress: string;
  city: string;
  phone: string;
  alternatePhone?: string | null;
  email: string | null;
  hasWebsite: boolean;
  websiteUrl: string | null;
  rating: number;
  reviewCount: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl: string;
  pipelineStage: PipelineStage;
  outreachNotes: string;
  emailEnrichmentStatus: EnrichmentStatus;
  pitchAngle?: string;
  ownerOrContact?: string | null;
  lastUpdated: string;
}

export interface SearchFilters {
  query: string;
  category: string;
  websiteFilter: 'all' | 'no_website' | 'has_website';
  hasPhoneOnly: boolean;
  hasEmailOnly: boolean;
  pipelineStage: string;
  minRating: number;
}

export interface GeoScanOptions {
  address: string;
  lat: number;
  lng: number;
  radiusKm: number;
  category: string;
  missingWebsiteOnly: boolean;
}

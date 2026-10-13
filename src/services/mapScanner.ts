import { BusinessLead, GeoScanOptions } from '../types/lead';

export interface PlacesScanResponse {
  leads: BusinessLead[];
  center?: { lat: number; lng: number };
  resolvedAddress?: string;
}

/**
 * Searches real Google Places via the backend server proxy using Google Places API (New)
 * and resolves accurate geocoded coordinates for any Nigerian town/district
 */
export const searchRealPlaces = async (options: GeoScanOptions): Promise<PlacesScanResponse> => {
  const response = await fetch('/api/search-places', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address: options.address,
      category: options.category,
      lat: options.lat,
      lng: options.lng,
      radiusKm: options.radiusKm,
      missingWebsiteOnly: options.missingWebsiteOnly,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to search Google Places (Status ${response.status})`);
  }

  const data = await response.json();
  return {
    leads: (data.leads || []) as BusinessLead[],
    center: data.center,
    resolvedAddress: data.resolvedAddress,
  };
};

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Known verified coordinates for Nigerian commercial districts and cities
const NIGERIAN_COORDINATES_MAP: Record<string, { lat: number; lng: number; formatted: string }> = {
  ipaja: { lat: 6.6074, lng: 3.2758, formatted: 'Ipaja, Lagos, Nigeria' },
  yaba: { lat: 6.5095, lng: 3.3711, formatted: 'Yaba, Lagos, Nigeria' },
  ikeja: { lat: 6.6018, lng: 3.3515, formatted: 'Ikeja, Lagos, Nigeria' },
  lekki: { lat: 6.4474, lng: 3.4756, formatted: 'Lekki Phase 1, Lagos, Nigeria' },
  'victoria island': { lat: 6.4281, lng: 3.4219, formatted: 'Victoria Island, Lagos, Nigeria' },
  vi: { lat: 6.4281, lng: 3.4219, formatted: 'Victoria Island, Lagos, Nigeria' },
  surulere: { lat: 6.4984, lng: 3.3578, formatted: 'Surulere, Lagos, Nigeria' },
  alaba: { lat: 6.4589, lng: 3.1972, formatted: 'Alaba International Market, Lagos, Nigeria' },
  festac: { lat: 6.4678, lng: 3.2844, formatted: 'Festac Town, Lagos, Nigeria' },
  'wuse 2': { lat: 9.0765, lng: 7.4646, formatted: 'Wuse 2, Abuja, Nigeria' },
  wuse: { lat: 9.0765, lng: 7.4646, formatted: 'Wuse, Abuja, Nigeria' },
  garki: { lat: 9.0275, lng: 7.4912, formatted: 'Garki, Abuja, Nigeria' },
  maitama: { lat: 9.0882, lng: 7.4934, formatted: 'Maitama, Abuja, Nigeria' },
  abuja: { lat: 9.0765, lng: 7.4646, formatted: 'Abuja, FCT, Nigeria' },
  'port harcourt': { lat: 4.8156, lng: 7.0498, formatted: 'Port Harcourt, Rivers, Nigeria' },
  ph: { lat: 4.8156, lng: 7.0498, formatted: 'Port Harcourt, Rivers, Nigeria' },
  ibadan: { lat: 7.3775, lng: 3.9470, formatted: 'Ibadan, Oyo, Nigeria' },
  bodija: { lat: 7.4333, lng: 3.9000, formatted: 'Bodija, Ibadan, Oyo, Nigeria' },
  dugbe: { lat: 7.3912, lng: 3.8763, formatted: 'Dugbe, Ibadan, Oyo, Nigeria' },
  kano: { lat: 12.0022, lng: 8.5920, formatted: 'Kano, Kano, Nigeria' },
  onitsha: { lat: 6.1498, lng: 6.7856, formatted: 'Onitsha, Anambra, Nigeria' },
  enugu: { lat: 6.4584, lng: 7.5464, formatted: 'Enugu, Enugu, Nigeria' },
  'benin city': { lat: 6.3350, lng: 5.6037, formatted: 'Benin City, Edo, Nigeria' },
  benin: { lat: 6.3350, lng: 5.6037, formatted: 'Benin City, Edo, Nigeria' },
  abeokuta: { lat: 7.1557, lng: 3.3451, formatted: 'Abeokuta, Ogun, Nigeria' }
};

// Initialize Google GenAI client (uses GEMINI_API_KEY from environment)
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper: Geocode any Nigerian address with fallback to known dictionary
async function geocodeNigeriaLocation(
  query: string,
  apiKey: string,
  defaultLat?: number,
  defaultLng?: number
): Promise<{ lat: number; lng: number; resolvedAddress: string }> {
  const clean = query.trim().toLowerCase();

  // Check known dictionary first for exact matches
  for (const [key, val] of Object.entries(NIGERIAN_COORDINATES_MAP)) {
    if (clean === key || clean.startsWith(key) || clean.includes(key)) {
      return { lat: val.lat, lng: val.lng, resolvedAddress: val.formatted };
    }
  }

  // Use Google Geocoding API for dynamic Nigerian locations
  if (apiKey && query) {
    try {
      const fullSearch = query.toLowerCase().includes('nigeria') ? query : `${query}, Nigeria`;
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullSearch
      )}&key=${apiKey}`;
      const geoRes = await fetch(geocodeUrl);
      if (geoRes.ok) {
        const geoData = (await geoRes.json()) as any;
        if (geoData.results && geoData.results.length > 0) {
          const loc = geoData.results[0].geometry.location;
          return {
            lat: loc.lat,
            lng: loc.lng,
            resolvedAddress: geoData.results[0].formatted_address || query,
          };
        }
      }
    } catch (e) {
      console.warn('Geocoding service error:', e);
    }
  }

  // Default fallback if provided or standard Lagos (Yaba)
  return {
    lat: defaultLat || 6.5095,
    lng: defaultLng || 3.3711,
    resolvedAddress: query || 'Lagos, Nigeria',
  };
}

// API: Live Google Places API Search (Places New)
app.post('/api/search-places', async (req, res) => {
  try {
    const { query, address, category, lat, lng, radiusKm, missingWebsiteOnly } = req.body;
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAbvbMqj21IP_DABcpeL-y09WABX4uW3t8';

    const searchTarget = address || query || 'Ipaja, Lagos';
    const { lat: targetLat, lng: targetLng, resolvedAddress } = await geocodeNigeriaLocation(
      searchTarget,
      apiKey,
      lat,
      lng
    );

    const cleanCategory = category === 'All Categories' ? 'businesses' : category;
    const textQuery = `${cleanCategory} in ${resolvedAddress || searchTarget}`;

    const requestBody: any = {
      textQuery,
      pageSize: 20,
      locationBias: {
        circle: {
          center: { latitude: targetLat, longitude: targetLng },
          radius: (Number(radiusKm) || 5) * 1000,
        },
      },
    };

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.googleMapsUri,places.types',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Places API error:', errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = (await response.json()) as any;
    const rawPlaces = data.places || [];

    let leads = rawPlaces.map((p: any) => {
      const name = p.displayName?.text || 'Local Business';
      const hasWebsite = Boolean(p.websiteUri && p.websiteUri.trim().length > 0);
      const phone = p.nationalPhoneNumber || p.internationalPhoneNumber || 'No phone listed';
      const formattedAddress = p.formattedAddress || `${name}, ${resolvedAddress}`;

      // Extract accurate neighborhood / city from Google Places address
      let city = 'Nigeria';
      if (p.formattedAddress) {
        const parts = p.formattedAddress.split(',').map((s: string) => s.trim());
        if (parts.length >= 3) {
          city = parts.slice(-3, -1).join(', ');
        } else if (parts.length >= 2) {
          city = parts.slice(-2).join(', ');
        } else {
          city = parts[0];
        }
      } else {
        city = resolvedAddress.split(',')[0] || 'Nigeria';
      }

      const placeLat = p.location?.latitude || targetLat;
      const placeLng = p.location?.longitude || targetLng;

      return {
        id: `place-${p.id}`,
        placeId: p.id,
        name,
        category:
          category !== 'All Categories'
            ? category
            : p.types?.[0]?.replace(/_/g, ' ') || 'Local Enterprise',
        formattedAddress,
        city,
        phone,
        alternatePhone:
          p.internationalPhoneNumber && p.internationalPhoneNumber !== p.nationalPhoneNumber
            ? p.internationalPhoneNumber
            : null,
        email: null, // Google Places does not expose email; we NEVER fabricate fake emails
        hasWebsite,
        websiteUrl: p.websiteUri || null,
        rating: typeof p.rating === 'number' ? p.rating : 0,
        reviewCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : 0,
        coordinates: {
          lat: placeLat,
          lng: placeLng,
        },
        googleMapsUrl:
          p.googleMapsUri ||
          `https://maps.google.com/?q=${encodeURIComponent(name + ' ' + formattedAddress)}`,
        pipelineStage: 'discovered',
        outreachNotes: hasWebsite
          ? 'Has website listed on Google'
          : 'Verified Google Maps business with NO active website.',
        emailEnrichmentStatus: 'pending',
        pitchAngle: `Help ${name} capture customer orders in ${city} via a mobile website with direct WhatsApp ordering.`,
        lastUpdated: new Date().toISOString(),
      };
    });

    if (missingWebsiteOnly) {
      leads = leads.filter((l: any) => !l.hasWebsite);
    }

    return res.json({
      leads,
      center: { lat: targetLat, lng: targetLng },
      resolvedAddress,
    });
  } catch (error: any) {
    console.error('Failed to search places:', error);
    return res.status(500).json({ error: error.message });
  }
});

// API: Contact & Email Enrichment with Fallback Finder
app.post('/api/enrich-lead', async (req, res) => {
  try {
    const { name, category, formattedAddress, phone, city } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        email: null,
        alternatePhone: null,
        ownerOrContact: null,
        confidence: 'not_found',
        source: 'Google Places Business Profile',
        pitchAngle: `Pitch ${name} on launching a WhatsApp-enabled catalog website to capture local leads in ${city || 'Nigeria'}.`
      });
    }

    const prompt = `You are an honest B2B sales intelligence agent analyzing a REAL Nigerian SME that has NO website.
Business Details:
- Name: "${name}"
- Category: "${category || 'Local Service'}"
- Address: "${formattedAddress || city || 'Nigeria'}"
- Known Primary Phone: "${phone || 'Unknown'}"
- Location: "${city || 'Nigeria'}"

STRICT RULES ABOUT EMAIL FOR NIGERIAN SMES:
1. Nigerian local businesses (barbers, mechanics, tailors, event planners, eateries, traders) operate via PHONE and WHATSAPP.
2. DO NOT GUESS OR INVENT ANY EMAIL ADDRESS.
3. If you do not have 100% verified knowledge of a real, public email address, set "email": null.
4. Returning null for email is the standard, expected, and honest answer.
5. In "pitchAngle", write 1-2 punchy sentences in courteous Nigerian business tone explaining how a simple 1-page mobile site with direct WhatsApp order button and bank details will stop competitors from taking their customers.

Output STRICT JSON ONLY:
{
  "email": string or null,
  "alternatePhone": string or null,
  "ownerOrContact": string or null,
  "confidence": "verified" | "not_found",
  "source": string,
  "pitchAngle": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsedResult: any;
    try {
      parsedResult = JSON.parse(text);
    } catch {
      parsedResult = {
        email: null,
        alternatePhone: null,
        ownerOrContact: null,
        confidence: 'not_found',
        source: 'Google Business Profile',
        pitchAngle: `Direct WhatsApp outreach: offer ${name} a responsive mobile catalog to capture customer calls.`
      };
    }

    // Safeguard: Filter out any fabricated or synthetic emails
    if (parsedResult.email) {
      const emailLower = String(parsedResult.email).toLowerCase();
      const cleanBusiness = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (
        emailLower.includes('example.com') ||
        emailLower.includes('fake') ||
        emailLower.includes(cleanBusiness) ||
        !emailLower.includes('@')
      ) {
        // Discard fabricated email
        parsedResult.email = null;
        parsedResult.confidence = 'not_found';
      }
    }

    return res.json(parsedResult);
  } catch (error: any) {
    console.error('Enrichment error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to enrich lead',
      fallback: {
        email: null,
        alternatePhone: null,
        confidence: 'not_found',
        source: 'Service Error Fallback'
      }
    });
  }
});

// API: Pitch & Cold Outreach Generator (WhatsApp / SMS / Email)
app.post('/api/generate-pitch', async (req, res) => {
  try {
    const { lead, pitchType } = req.body;
    if (!lead || !lead.name) {
      return res.status(400).json({ error: 'Lead details required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        subject: `Partnership inquiry regarding ${lead.name} in ${lead.city || 'Nigeria'}`,
        body: `Good day ${lead.name} team,\n\nI was looking for verified ${lead.category || 'services'} in ${lead.city || 'your area'} and noticed your high ratings, but you don't have an official mobile website or online catalog.\n\nMany customers search on Google and prefer seeing your price list or chatting on WhatsApp directly without waiting. A fast 1-page mobile website with your WhatsApp click-to-chat button will help you get more paying customers every week.\n\nCan I send you a 2-minute mockup of what your site could look like?\n\nWarm regards,\nDigital Growth Consultant`,
      });
    }

    const prompt = `You are an expert sales consultant writing cold outreach for a Nigerian business with NO website.
Business Name: ${lead.name}
Category: ${lead.category || 'Local Business'}
City / State: ${lead.city || 'Nigeria'}
Phone: ${lead.phone || 'None'}
Pitch Type: ${pitchType || 'friendly_audit'}

Write an effective outreach message tailored to Nigerian entrepreneurs:
- Mention pain points: answering "How much?" on WhatsApp all day, losing customers who search Google and choose competitors with websites, or diaspora clients who want to pay online.
- Pitch a simple, fast mobile site with instant WhatsApp ordering and bank payment details.
- Polite, respectful Nigerian business etiquette ("Good day sir/ma", "Warm regards").
- Keep under 110 words.

Return strictly JSON:
{
  "subject": "Subject for email or header for WhatsApp",
  "body": "Outreach message body"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Pitch generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate pitch' });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();

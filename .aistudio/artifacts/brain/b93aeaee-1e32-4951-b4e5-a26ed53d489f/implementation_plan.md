# Nigeria & Africa Business Lead Scout & WhatsApp Outreach CRM

Pivot and specialize the prospecting platform for Nigeria and African commercial hubs, removing all existing mock data, integrating WhatsApp click-to-chat outreach, and tailoring local business categories and search presets.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your confirmed choices:
> 1. **Zero Mock Leads**: Existing US mock data is completely wiped; the database starts clean, ready for live searches across Nigeria and Africa.
> 2. **WhatsApp First Outreach**: Integrated 1-click WhatsApp messaging (`https://wa.me/`) alongside direct phone dialer and email, with pre-filled WhatsApp pitch templates.
> 3. **Nigeria & African Regional Hubs**: Default map center set to Lagos, Nigeria, with one-click presets for Abuja, Port Harcourt, Ibadan, Kano, Accra (Ghana), Nairobi (Kenya), and Kigali (Rwanda).

---

## 1. Overview & Core Concept

### What It Does
Empowers digital agencies, web developers, and growth consultants in Nigeria and Africa to find high-opportunity local businesses on Google Maps that operate without an official website. The tool captures verified phone numbers and emails, enables instant WhatsApp and direct phone pitching, and manages prospects in a searchable spreadsheet grid and Kanban pipeline.

### Why WhatsApp Integration is Vital for Africa
In Nigeria and broader African markets, over 90% of business communication and customer inquiries happen over WhatsApp. Traditional cold emails often have lower open rates, whereas a personalized WhatsApp message highlighting lost customers from not having a website delivers 5x to 10x higher response rates.

---

## 2. Key User Flows & Regional Features

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. MAP DISCOVERY ACROSS NIGERIA & AFRICA                                    │
│ Default: Lagos, Nigeria (Ikeja/Lekki) ──> Presets: Abuja, Port Harcourt,    │
│ Ibadan, Accra, Nairobi ──> Select African SME category ──> Scan boundary    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. WHATSAPP & PHONE ENRICHMENT                                              │
│ Capture +234/local phone ──> Format for WhatsApp (+23480...) ──> Auto-find │
│ contact email ──> Generate WhatsApp pitch template                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. SPREADSHEET DATABASE & SALES PIPELINE                                    │
│ Clean spreadsheet ──> Click-to-WhatsApp button ──> Move stage in Kanban     │
│ ──> Export to CSV/Excel                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### African Commercial Categories
- **Fashion & Bespoke Tailoring** (Losing international diaspora buyers without an online catalog)
- **Logistics & Dispatch Services** (Need automated booking and package tracking landing pages)
- **Event Centers & Catering** (Need date availability calendars and booking forms)
- **Auto Mechanics & Spare Parts** (Need verified Google location and service quote calculators)
- **Private Schools & Academies** (Need student enrollment and fee structure portals)
- **Clinics, Diagnostic Centers & Pharmacies** (Need appointment booking)
- **Supermarkets, Groceries & Wholesalers** (Need digital inventory showcases)
- **Real Estate & Shortlets / Apartments** (Need direct booking to avoid high Airbnb/booking fees)
- **Restaurants, Grills & Bukas** (Need online ordering menus)

---

## 3. Technical Architecture & Modifications

### A. Clear All Mock Data & Storage Reset
- Remove US sample records completely.
- Reset `localStorage` database so the app opens with a clean slate ready for Nigerian prospect scanning.
- Provide a "Scan Lagos / Nigerian Hub" one-click action.

### B. Map Geocoding & Regional Presets
- Default map center: Lagos, Nigeria (`{ lat: 6.5244, lng: 3.3792 }`, zoom: 12).
- Regional presets:
  - **Lagos, Nigeria** (Mainland & Island)
  - **Abuja, Nigeria** (CBD, Wuse, Garki)
  - **Port Harcourt, Nigeria**
  - **Ibadan, Nigeria**
  - **Kano, Nigeria**
  - **Accra, Ghana**
  - **Nairobi, Kenya**
  - **Johannesburg, South Africa**
  - **Kigali, Rwanda**

### C. WhatsApp Click-to-Chat Engine
- Phone normalizer: formats local Nigerian numbers (e.g. `0803 123 4567` or `+234 803 123 4567`) into clean international E.164 format (`2348031234567`).
- WhatsApp button directly in the Spreadsheet row, Kanban card, Map preview card, and Pitch modal.
- Generates tailored WhatsApp pitch text with one-click direct chat link.

### D. Outreach Message Customization for Nigerian/African Businesses
- Angles tailored for African SMEs:
  - *Instagram/WhatsApp Fatigue*: "Stop losing hours answering 'how much?' on WhatsApp. A simple website automates orders 24/7."
  - *Diaspora & Trust*: "Diaspora Nigerians looking to hire local services in Lagos/Abuja book providers with official websites."
  - *Google Maps Traffic*: "People searching for services around your area call competitors because you have no website listed."

---

## 4. Verification Plan

1. Verify `localStorage` is cleared of US mock data.
2. Verify default map loads centered on Lagos/Nigeria.
3. Test WhatsApp click-to-chat button formats phone numbers properly (`https://wa.me/234...`).
4. Run `compile_applet` and `lint_applet` to confirm clean build.

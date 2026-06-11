# ✈️ Tripp - Next.js AI Travel Planner

Tripp is an AI-powered travel planning and mapping application built using Next.js. It helps users generate customized travel itineraries and view them on interactive map layouts.

---

## ✨ Features

- **AI Itinerary Planner**: Uses the Google Generative AI SDK (`@google/generative-ai`) to design custom itineraries.
- **Interactive Map Layers**: Integrates Mapbox GL and React Map GL to display destinations, route paths, and POIs.
- **Supabase Integration**: Uses Supabase database and authentication clients (`@supabase/ssr` / `@supabase/supabase-js`) for storage, sessions, and transaction handling.
- **3D Visualization**: Integrates React Three Fiber (`three` / `@react-three/fiber` / `@react-three/drei`) for 3D globe views and animations.
- **Safety Wrappers**: Uses custom scripts (`scripts/next-safe.js`) to secure startup environments and parse variables.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (React 18, TypeScript)
- **Database / Auth**: Supabase SSR
- **AI Integrations**: Gemini API (Google Generative AI)
- **Mapping**: Mapbox GL, React Map GL
- **Graphics / 3D**: Three.js, React Three Fiber
- **Styling / Motion**: Tailwind CSS, Framer Motion, Radix UI

---

## 📂 Project Structure

- `app/` — Next.js routing views and api controllers.
- `components/` — Reusable components (e.g. Map, Planner, Header, Auth).
- `data/` — Static data assets and schemas.
- `hooks/` — React hooks for state, session, and map.
- `lib/` — Database helpers and general configurations.
- `scripts/` — System environment execution scripts.
- `supabase/` — Database schemas and SQL statements (`SUPABASE_SCHEMA.sql`).
- `V1` to `V5` & `TripV5` — Archive folders and snapshots of previous design iterations.

---

## ⚙️ Running Locally

1. Create a `.env.local` file containing your target service endpoints:
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token`
   - `NEXT_PUBLIC_SUPABASE_URL=your_supabase_url`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`
   - `GEMINI_API_KEY=your_gemini_key`

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development environment:
   ```bash
   npm run dev
   ```

4. Build production code:
   ```bash
   npm run build
   ```
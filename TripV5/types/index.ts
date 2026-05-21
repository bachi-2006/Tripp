// ── User ──────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
}

// ── Room ──────────────────────────────────────────
export interface Room {
  id: string;
  code: string;
  destination: string;
  days: number;
  max_members: number;
  start_date?: string;
  created_by: string;
  created_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
}

// ── Chat ──────────────────────────────────────────
export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

// ── Itinerary ─────────────────────────────────────
export interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location?: string;
  type: "attraction" | "food" | "transport" | "hotel" | "activity";
}

// ── Packing ───────────────────────────────────────
export interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
}

// ── Documents ─────────────────────────────────────
export interface TravelDocument {
  id: string;
  name: string;
  type: "flight" | "hotel" | "insurance" | "visa" | "other";
  file_url?: string;
  details: string;
  uploaded_at: string;
}

// ── Food ──────────────────────────────────────────
export interface Restaurant {
  name: string;
  cuisine: string;
  rating: number;
  price_range: string;
  description: string;
}

// ── Globe ─────────────────────────────────────────
export interface Wonder {
  name: string;
  lat: number;
  lng: number;
  description: string;
  image: string;
}

// ── Features ──────────────────────────────────────
export interface DashboardFeatureProps {
  room: Room;
  user: UserProfile;
  onLocationChange: (location: string) => void;
}

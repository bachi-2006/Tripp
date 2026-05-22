"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Plus,
  ArrowRight,
  Loader2,
  LogIn,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthModal from "@/app/components/auth/AuthModal";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export default function RoomForm() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [members, setMembers] = useState(4);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    if (searchParams?.get("signin") === "true") setAuthModalOpen(true);
    if (searchParams?.get("error") === "not_found")
      setError("Room not found. Check the code and try again.");

    return () => subscription.unsubscribe();
  }, [searchParams, supabase.auth]);

  const createRoom = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!destination.trim()) {
      setError("Enter a destination");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const code = generateCode();
      const { data: room, error: dbError } = await supabase
        .from("rooms")
        .insert({
          code,
          destination: destination.trim(),
          days,
          max_members: members,
          created_by: user.id,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      await supabase.from("room_members").insert({
        room_id: room.id,
        user_id: user.id,
        role: "owner",
      });

      router.push(`/room?code=${code}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (joinCode.length !== 6) {
      setError("Enter a valid 6-character code");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { data: room } = await supabase
        .from("rooms")
        .select("id, code")
        .eq("code", joinCode.toUpperCase())
        .single();

      if (!room) {
        setError("Room not found");
        setLoading(false);
        return;
      }
      router.push(`/room?code=${room.code}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Compass className="w-8 h-8 text-teal-600" />
            <span className="text-2xl font-bold text-gray-900">Tripp</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Plan Your Next Adventure
          </h1>
          <p className="text-gray-500">
            Create a room to plan together, or join an existing one
          </p>
          {!user && (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="mt-3 inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              <LogIn className="w-4 h-4" />
              Sign in to get started
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create room */}
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <Plus className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Create New Room
                </h2>
                <p className="text-xs text-gray-500">
                  Start a trip planning room
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where are you going?"
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Days
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                      min={1}
                      max={30}
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Members
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={members}
                      onChange={(e) =>
                        setMembers(parseInt(e.target.value) || 2)
                      }
                      min={2}
                      max={20}
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={createRoom}
                disabled={loading}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create Room
              </button>
            </div>
          </div>

          {/* Join room */}
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Join Existing Room
                </h2>
                <p className="text-xs text-gray-500">
                  Enter a room code to join
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) =>
                    setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                  }
                  placeholder="XXXXXX"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-center text-2xl font-mono tracking-[0.5em] uppercase"
                  maxLength={6}
                />
              </div>

              <button
                onClick={joinRoom}
                disabled={joinCode.length !== 6 || loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Join Room
              </button>

              <p className="text-xs text-center text-gray-400">
                Ask the room creator for the 6-character code
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView="signin"
      />
    </>
  );
}

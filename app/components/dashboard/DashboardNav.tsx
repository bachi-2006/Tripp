"use client";

import { Compass, Menu, Share2, Users, LogOut } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Room, UserProfile } from "@/types";

interface DashboardNavProps {
  room: Room;
  user: UserProfile;
  onMenuClick: () => void;
}

export default function DashboardNav({
  room,
  user,
  onMenuClick,
}: DashboardNavProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    toast.success("Room code copied!");
  };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={onMenuClick}>
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-teal-600" />
          <span className="font-bold text-gray-900 hidden sm:inline">
            Tripp
          </span>
        </Link>
        <span className="text-gray-300 hidden sm:inline">|</span>
        <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
          {room.destination}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={copyRoomCode}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          title="Copy room code to share"
        >
          <Share2 className="w-3 h-3" />
          <span className="font-mono">{room.code}</span>
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">{user.name}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

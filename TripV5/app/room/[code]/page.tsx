import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardShell from "@/app/components/dashboard/DashboardShell";

export default async function RoomDashboard({
  params,
}: {
  params: { code: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/room?signin=true");
  }

  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", params.code.toUpperCase())
    .single();

  if (!room) {
    redirect("/room?error=not_found");
  }

  // Auto-join if not already a member
  const { data: membership } = await supabase
    .from("room_members")
    .select("id")
    .eq("room_id", room.id)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    await supabase.from("room_members").insert({
      room_id: room.id,
      user_id: user.id,
      role: "member",
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userData = profile || {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || user.email!.split("@")[0],
  };

  return <DashboardShell room={room} user={userData} />;
}

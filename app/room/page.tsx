import { Suspense } from "react";
import RoomForm from "@/app/components/room/RoomForm";

export const metadata = {
  title: "Plan a Trip — Tripp",
};

export default function RoomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center p-4">
      <Suspense>
        <RoomForm />
      </Suspense>
    </div>
  );
}

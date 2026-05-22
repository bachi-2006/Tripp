"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Trash2, Plus } from "lucide-react";
import type { DashboardFeatureProps, TravelDocument } from "@/types";

const docTypes = [
  { value: "flight", label: "Flight Booking", emoji: "✈️" },
  { value: "hotel", label: "Hotel Reservation", emoji: "🏨" },
  { value: "insurance", label: "Travel Insurance", emoji: "🛡️" },
  { value: "visa", label: "Visa Document", emoji: "📋" },
  { value: "other", label: "Other", emoji: "📄" },
];

export default function DocumentManager({ room }: DashboardFeatureProps) {
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: "",
    type: "other",
    details: "",
  });
  const supabase = createClient();

  useEffect(() => {
    // 1. Fetch from Supabase directly
    const loadDocs = async () => {
      const { data } = await supabase
        .from("travel_documents")
        .select("*")
        .eq("room_id", room.id)
        .order("uploaded_at", { ascending: false });

      if (data) setDocuments(data);
    };

    loadDocs();

    // 2. Real-time Subscription config for Document Manager
    const channel = supabase
      .channel(`docs-${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "travel_documents", filter: `room_id=eq.${room.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDocuments((prev) => [payload.new as TravelDocument, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setDocuments((prev) => prev.filter((doc) => doc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, supabase]);

  const addDocument = async () => {
    if (!newDoc.name.trim()) return;
    setShowUpload(false);

    await supabase.from("travel_documents").insert({
      room_id: room.id,
      name: newDoc.name.trim(),
      type: newDoc.type,
      details: newDoc.details,
    });

    setNewDoc({ name: "", type: "other", details: "" });
  };

  const removeDocument = async (id: string) => {
    // Optimistic Delete
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await supabase.from("travel_documents").delete().eq("id", id);
  };

  const getEmoji = (type: string) =>
    docTypes.find((d) => d.value === type)?.emoji || "📄";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-gray-500 mt-1">
            Manage your travel documents for{" "}
            {room.destination || "your trip"}
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Add document form */}
      {showUpload && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Name
            </label>
            <input
              type="text"
              value={newDoc.name}
              onChange={(e) =>
                setNewDoc({ ...newDoc, name: e.target.value })
              }
              placeholder="e.g., Flight to Paris"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={newDoc.type}
              onChange={(e) =>
                setNewDoc({ ...newDoc, type: e.target.value })
              }
              className="w-full px-4 py-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {docTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.emoji} {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details / Notes
            </label>
            <textarea
              value={newDoc.details}
              onChange={(e) =>
                setNewDoc({ ...newDoc, details: e.target.value })
              }
              placeholder="Confirmation number, check-in time, etc."
              rows={3}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={addDocument}
              disabled={!newDoc.name.trim()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save Document
            </button>
            <button
              onClick={() => setShowUpload(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Document list */}
      {documents.length === 0 && !showUpload ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">
            No documents yet
          </h3>
          <p className="text-sm text-gray-500">
            Add your travel documents to keep everything organized
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border p-5 flex items-start gap-4 group hover:shadow-md transition-shadow"
            >
              <div className="text-2xl">{getEmoji(doc.type)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{doc.name}</h3>
                <p className="text-sm text-gray-500 capitalize">
                  {doc.type.replace("_", " ")}
                </p>
                {doc.details && (
                  <p className="text-sm text-gray-600 mt-1">{doc.details}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Added{" "}
                  {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => removeDocument(doc.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Plus, Trash2, Package } from "lucide-react";
import type { DashboardFeatureProps, PackingItem } from "@/types";

const DEFAULT_ITEMS: Omit<PackingItem, "id" | "packed">[] = [
  { name: "T-shirts", category: "Clothing" },
  { name: "Pants / Shorts", category: "Clothing" },
  { name: "Underwear & Socks", category: "Clothing" },
  { name: "Jacket", category: "Clothing" },
  { name: "Comfortable Shoes", category: "Clothing" },
  { name: "Phone & Charger", category: "Electronics" },
  { name: "Power Bank", category: "Electronics" },
  { name: "Camera", category: "Electronics" },
  { name: "Headphones", category: "Electronics" },
  { name: "Passport", category: "Documents" },
  { name: "Travel Insurance", category: "Documents" },
  { name: "Boarding Pass", category: "Documents" },
  { name: "Hotel Confirmation", category: "Documents" },
  { name: "Toothbrush & Toothpaste", category: "Toiletries" },
  { name: "Sunscreen", category: "Toiletries" },
  { name: "Medications", category: "Toiletries" },
  { name: "Water Bottle", category: "Essentials" },
  { name: "Snacks", category: "Essentials" },
  { name: "Day Backpack", category: "Essentials" },
  { name: "Travel Pillow", category: "Essentials" },
];

const categories = [
  "Clothing",
  "Electronics",
  "Documents",
  "Toiletries",
  "Essentials",
];

export default function PackingChecklist({ room }: DashboardFeatureProps) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Essentials");
  const supabase = createClient();

  useEffect(() => {
    // 1. Fetch initial items from supabase
    const loadItems = async () => {
      const { data } = await supabase
        .from("packing_items")
        .select("*")
        .eq("room_id", room.id)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setItems(data);
      } else {
        // If empty, sync default items to DB
        const defaults = DEFAULT_ITEMS.map((item) => ({
          room_id: room.id,
          name: item.name,
          category: item.category,
          packed: false
        }));
        await supabase.from("packing_items").insert(defaults);
      }
    };

    loadItems();

    // 2. Real-time Subscription for collaborative packing
    const channel = supabase
      .channel(`packing-${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "packing_items", filter: `room_id=eq.${room.id}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems((prev) => [...prev, payload.new as PackingItem]);
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) => prev.map((item) => item.id === payload.new.id ? (payload.new as PackingItem) : item));
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, supabase]);

  const toggleItem = async (id: string, currentPacked: boolean) => {
    // Optimistic UI update
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, packed: !currentPacked } : item));
    await supabase.from("packing_items").update({ packed: !currentPacked }).eq("id", id);
  };

  const addItem = async () => {
    if (!newItemName.trim()) return;
    const name = newItemName.trim();
    setNewItemName("");

    await supabase.from("packing_items").insert({
      room_id: room.id,
      name: name,
      category: newItemCategory,
    });
  };

  const removeItem = async (id: string) => {
    // Optimistic UI update
    setItems((prev) => prev.filter((item) => item.id !== id));
    await supabase.from("packing_items").delete().eq("id", id);
  };

  const packedCount = items.filter((i) => i.packed).length;
  const progress = items.length
    ? Math.round((packedCount / items.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Packing Checklist
        </h2>
        <p className="text-gray-500 mt-1">
          Keep track of everything you need for{" "}
          {room.destination || "your trip"}
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {packedCount} of {items.length} items packed
          </span>
          <span className="text-sm font-bold text-teal-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-teal-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Add item */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add new item..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={addItem}
            disabled={!newItemName.trim()}
            className="px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items by category */}
      {categories.map((category) => {
        const categoryItems = items.filter((i) => i.category === category);
        if (categoryItems.length === 0) return null;
        return (
          <div
            key={category}
            className="bg-white rounded-xl border overflow-hidden"
          >
            <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <h3 className="font-medium text-gray-700">{category}</h3>
              <span className="text-xs text-gray-400 ml-auto">
                {categoryItems.filter((i) => i.packed).length}/
                {categoryItems.length}
              </span>
            </div>
            <div className="divide-y">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-6 py-3 group hover:bg-gray-50"
                >
                  <button
                    onClick={() => toggleItem(item.id, item.packed)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${item.packed
                      ? "bg-teal-500 border-teal-500"
                      : "border-gray-300 hover:border-teal-500"
                      }`}
                  >
                    {item.packed && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${item.packed
                      ? "line-through text-gray-400"
                      : "text-gray-700"
                      }`}
                  >
                    {item.name}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

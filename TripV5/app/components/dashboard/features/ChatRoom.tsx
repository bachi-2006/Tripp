"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DashboardFeatureProps, ChatMessage } from "@/types";

export default function ChatRoom({ room, user }: DashboardFeatureProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load messages & subscribe to real-time updates
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", room.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (data) setMessages(data);
    };

    loadMessages();

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, supabase]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");

    // AI message detection
    if (text.startsWith("/ai ") || text.startsWith("@ai ")) {
      const aiPrompt = text.replace(/^(\/ai\s|@ai\s)/, "");
      setLoading(true);

      // Insert user message
      await supabase.from("chat_messages").insert({
        room_id: room.id,
        user_id: user.id,
        user_name: user.name,
        message: text,
      });

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: aiPrompt,
            destination: room.destination,
          }),
        });
        const data = await res.json();

        // Insert AI response
        await supabase.from("chat_messages").insert({
          room_id: room.id,
          user_id: user.id,
          user_name: "Tripp AI 🤖",
          message: data.reply || "Sorry, I couldn't process that.",
        });
      } catch {
        await supabase.from("chat_messages").insert({
          room_id: room.id,
          user_id: user.id,
          user_name: "Tripp AI 🤖",
          message: "Sorry, I'm having trouble responding right now.",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Regular message
    await supabase.from("chat_messages").insert({
      room_id: room.id,
      user_id: user.id,
      user_name: user.name,
      message: text,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Chat Room</h2>
        <p className="text-gray-500 mt-1">
          Chat with your travel group. Type{" "}
          <code className="text-teal-600 bg-teal-50 px-1 rounded">
            /ai
          </code>{" "}
          to ask Tripp AI.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border p-4 space-y-3 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg) => {
          const isOwn =
            msg.user_id === user.id && !msg.user_name.includes("AI");
          const isAI = msg.user_name.includes("AI");
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isAI
                    ? "bg-purple-50 border border-purple-200"
                    : isOwn
                      ? "bg-teal-500 text-white"
                      : "bg-gray-100"
                  }`}
              >
                {!isOwn && (
                  <p
                    className={`text-xs font-medium mb-1 ${isAI ? "text-purple-600" : "text-gray-500"
                      }`}
                  >
                    {msg.user_name}
                  </p>
                )}
                <p
                  className={`text-sm whitespace-pre-wrap ${isOwn ? "text-white" : "text-gray-800"
                    }`}
                >
                  {msg.message}
                </p>
                <p
                  className={`text-xs mt-1 ${isOwn ? "text-teal-100" : "text-gray-400"
                    }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message... (use /ai for AI help)"
          className="flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && sendMessage()
          }
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-xl transition-colors"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

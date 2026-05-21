"use client";

import { motion } from "framer-motion";
import {
  Map,
  Plane,
  Utensils,
  PackageCheck,
  FileText,
  MessageSquare,
  Globe,
  Wallet,
  Languages,
  Wifi,
} from "lucide-react";

const features = [
  {
    icon: Map,
    name: "Smart Itinerary",
    description: "AI-generated day-by-day travel plans",
  },
  {
    icon: Plane,
    name: "Flight Search",
    description: "Find and compare flights easily",
  },
  {
    icon: Utensils,
    name: "Food Explorer",
    description: "Discover local cuisine and restaurants",
  },
  {
    icon: PackageCheck,
    name: "Packing List",
    description: "Never forget essentials again",
  },
  {
    icon: FileText,
    name: "Doc Manager",
    description: "Keep all travel docs organized",
  },
  {
    icon: MessageSquare,
    name: "Group Chat",
    description: "Real-time chat with travel mates",
  },
  {
    icon: Globe,
    name: "Interactive Maps",
    description: "Explore destinations visually",
  },
  {
    icon: Wallet,
    name: "Budget Tracker",
    description: "Track expenses on the go",
  },
  {
    icon: Languages,
    name: "Translation",
    description: "Break language barriers",
  },
  {
    icon: Wifi,
    name: "Offline Access",
    description: "Access plans without internet",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Travel
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            From planning to packing, from booking to chatting — Tripp has you
            covered with AI-powered tools for every step of your journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                className="bg-white rounded-xl border p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {feature.name}
                </h3>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

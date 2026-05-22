"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Solo Traveler",
    quote:
      "Tripp's AI itinerary saved me hours of planning for my Japan trip. Every recommendation was spot-on!",
    rating: 5,
  },
  {
    name: "Marco & Elena",
    role: "Couple Travelers",
    quote:
      "The real-time chat and shared planning made our honeymoon planning so much easier. Best travel app ever!",
    rating: 5,
  },
  {
    name: "David Park",
    role: "Group Organizer",
    quote:
      "Managing a trip for 8 friends was a nightmare until we found Tripp. The room feature is a game-changer.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by Travelers
          </h2>
          <p className="text-gray-500">See what our community has to say</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-white rounded-2xl border p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 text-amber-500 fill-amber-500"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

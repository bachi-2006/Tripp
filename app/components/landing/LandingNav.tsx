"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, Menu, X } from "lucide-react";
import AuthModal from "@/app/components/auth/AuthModal";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm"
            : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Compass
                className={`w-6 h-6 ${scrolled ? "text-teal-600" : "text-white"
                  }`}
              />
              <span
                className={`text-xl font-bold ${scrolled ? "text-gray-900" : "text-white"
                  }`}
              >
                Tripp
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className={`text-sm font-medium transition-colors ${scrolled
                    ? "text-gray-600 hover:text-gray-900"
                    : "text-white/80 hover:text-white"
                  }`}
              >
                Features
              </a>
              <a
                href="#testimonials"
                className={`text-sm font-medium transition-colors ${scrolled
                    ? "text-gray-600 hover:text-gray-900"
                    : "text-white/80 hover:text-white"
                  }`}
              >
                Testimonials
              </a>
              <Link
                href="/room"
                className={`text-sm font-medium transition-colors ${scrolled
                    ? "text-gray-600 hover:text-gray-900"
                    : "text-white/80 hover:text-white"
                  }`}
              >
                Plan Trip
              </Link>
            </div>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/room"
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-full hover:bg-teal-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className={`text-sm font-medium ${scrolled ? "text-gray-600" : "text-white/80"
                      }`}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthView("signin");
                      setAuthModalOpen(true);
                    }}
                    className={`text-sm font-medium ${scrolled
                        ? "text-gray-600 hover:text-gray-900"
                        : "text-white/80 hover:text-white"
                      }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthView("signup");
                      setAuthModalOpen(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-full hover:bg-teal-600 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X
                  className={`w-6 h-6 ${scrolled ? "text-gray-900" : "text-white"
                    }`}
                />
              ) : (
                <Menu
                  className={`w-6 h-6 ${scrolled ? "text-gray-900" : "text-white"
                    }`}
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#features"
                className="block text-gray-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="block text-gray-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              <Link
                href="/room"
                className="block text-gray-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Plan Trip
              </Link>
              <hr />
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="block text-gray-600 font-medium"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthView("signin");
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block text-gray-600 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthView("signup");
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center py-2 bg-teal-500 text-white rounded-lg font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView={authView}
      />
    </>
  );
}

"use client";
import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col items-center justify-center p-6 text-center">
      
      {/* HERO SECTION */}
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
        <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
          ⚡ Powered by Zenta Hub
        </span>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Instant Data Bundles & <span className="text-red-500">Voucher E-PINs</span>
        </h1>

        <p className="text-gray-400 text-sm md:text-base">
          The fastest automated platform for affordable data bundles, exam checkers, and secure AFA Ghana Card registrations in Ghana.
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link 
            href="/login" 
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-8 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-900/30"
          >
            Log In to Account
          </Link>
          <Link 
            href="/signup" 
            className="bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white font-bold py-3.5 px-8 rounded-2xl border border-gray-800 text-xs uppercase tracking-wider transition"
          >
            Create Free Account
          </Link>
          <Link 
            href="/afa" 
            className="bg-black/50 hover:bg-gray-900 text-gray-400 hover:text-white font-bold py-3.5 px-6 rounded-2xl border border-gray-800 text-xs uppercase tracking-wider transition"
          >
            AFA Portal
          </Link>
        </div>
      </div>

      {/* FOOTER BADGE */}
      <div className="absolute bottom-6 text-xs text-gray-600 font-mono">
        Zenta Deals Platform &copy; {new Date().getFullYear()} — All rights reserved.
      </div>

    </div>
  );
}
"use client";
import React from 'react';
import Link from 'next/link';

export default function MobileNavbar({ onToggleSidebar, isLightMode, onToggleTheme }: any) {
  return (
    <div className="md:hidden bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="Zenta Deals" className="h-8 w-auto object-contain" />
        <span className="font-extrabold text-sm text-white">Zenta <span className="text-blue-500">Deals</span></span>
      </Link>

      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-gray-700 text-sm text-white"
        >
          {isLightMode ? '☀️' : '🌙'}
        </button>

        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center"
          aria-label="Open Menu"
        >
          ☰
        </button>
      </div>
    </div>
  );
}
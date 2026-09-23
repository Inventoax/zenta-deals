"use client";
import React from 'react';
import AdminSidebar from '../../components/AdminSidebar'; // <--- Importing your new file

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      
      {/* 1. THE DEDICATED ADMIN MENU */}

      {/* 2. THE CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-black h-screen">
        {children}
      </main>
    </div>
  );
}
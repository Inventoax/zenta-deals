"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../components/Sidebar";
import AdminSidebar from "../components/AdminSidebar";
import MobileNavbar from "../components/Navbar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isAuthPage = pathname === '/login' || pathname === '/register';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const toggleTheme = () => setIsLightMode(!isLightMode);

  if (isAuthPage) {
    return (
      <html lang="en">
        <body className="bg-[#0f172a] text-white antialiased min-h-screen">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`bg-[#0f172a] text-white antialiased flex flex-col md:flex-row min-h-screen ${isLightMode ? 'bg-gray-100 text-gray-900' : ''}`}>
        
        {/* Mobile Header */}
        <MobileNavbar 
          onToggleSidebar={() => setIsSidebarOpen(true)} 
          isLightMode={isLightMode}
          onToggleTheme={toggleTheme}
        />

        {/* Conditional Sidebar: Admin vs User */}
        {isAdmin ? (
          <AdminSidebar />
        ) : (
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            isLightMode={isLightMode}
            toggleTheme={toggleTheme}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen bg-[#0f172a] text-white p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
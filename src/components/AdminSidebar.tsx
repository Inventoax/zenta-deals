"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    const confirmExit = window.confirm("⚠️ SECURE LOGOUT\n\nAre you sure you want to end your Admin Session?");
    if (confirmExit) {
      router.push('/login'); 
    }
  };

  return (
    <aside className="w-64 bg-[#1a0505] border-r border-red-900/30 flex flex-col h-screen sticky top-0 hidden md:flex">
      
      {/* BRAND */}
      <div className="p-6 border-b border-red-900/20">
        <h1 className="text-2xl font-bold text-red-500 tracking-tight">ZENTA ADMIN</h1>
        <p className="text-xs text-red-300/50 mt-1">Master Control</p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto custom-scrollbar">
        <AdminLink href="/admin" icon="⚡" label="Users wallets" active={pathname === "/admin"} />
        <AdminLink href="/admin/users" icon="👥" label="Users & Agents" active={pathname === "/admin/users"} />
        <AdminLink href="/admin/orders" icon="📦" label="Transactions" active={pathname === "/admin/orders"} />
        <AdminLink href="/admin/data-plans" icon="📶" label="Data Plans" active={pathname === "/admin/data-plans"} />
        <AdminLink href="/admin/afa" icon="📝" label="AFA Requests" active={pathname === "/admin/afa"} />
        <AdminLink href="/admin/vouchers" icon="🎟️" label="Inventory" active={pathname === "/admin/vouchers"} />
        <AdminLink href="/admin/settings" icon="⚙️" label="Settings" active={pathname === "/admin/settings"} />
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="p-4 border-t border-red-900/20 mt-auto space-y-3">
        <Link href="/">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition group">
            <span className="group-hover:-translate-x-1 transition">🔙</span>
            <span className="font-medium text-sm">Switch to User App</span>
          </button>
        </Link>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white transition shadow-lg shadow-red-900/10 group"
        >
          <span className="text-xl group-hover:rotate-180 transition duration-500">🚪</span>
          <span className="font-bold text-sm">Secure Sign Out</span>
        </button>
      </div>

    </aside>
  );
}

function AdminLink({ href, icon, label, active }: any) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
        active ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-red-900/10 hover:text-red-400'
      }`}>
        <span className="text-xl">{icon}</span>
        <span className="font-bold text-sm">{label}</span>
      </div>
    </Link>
  );
}
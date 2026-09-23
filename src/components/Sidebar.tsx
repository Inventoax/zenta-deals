"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar({ isOpen, onClose, isLightMode, toggleTheme }: any) {
  const pathname = usePathname(); 
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState("");

  const handleLogout = () => {
    const confirmExit = window.confirm("Are you sure you want to sign out?");
    if (confirmExit) {
      router.push('/login'); 
    }
  };

  return (
    <>
      {/* Mobile Backdrop overlay when menu is open */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-50 w-64 bg-gray-800 border-r border-gray-700 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* BRAND / LOGO WITH TEXT */}
        <div className="p-6 flex items-center justify-between border-b border-gray-700/50">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Zenta Deals" 
              className="h-8 w-auto object-contain"
            />
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">Zenta <span className="text-blue-500">Deals</span></span>
              <p className="text-[10px] text-gray-400">Enterprise Portal</p>
            </div>
          </Link>
          
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        
        {/* MENU */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar relative">
          <NavItem href="/" icon="🏠" label="Dashboard" active={pathname === "/"} />
          <NavItem href="/buy" icon="🛒" label="Buy Data" active={pathname === "/buy"} />
          <NavItem href="/orders" icon="📦" label="Orders" active={pathname === "/orders"} />
          <NavItem href="/submit" icon="📋" label="Submit Numbers" active={pathname === "/submit"} />
          <NavItem href="/vouchers" icon="🎟️" label="Vouchers" active={pathname === "/vouchers"} />
          <NavItem href="/afa" icon="📝" label="AFA Registration" active={pathname === "/afa"} />
          <NavItem href="/wallet" icon="💳" label="Wallet" active={pathname === "/wallet"} />
          
          {/* WHATSAPP LINK */}
          <div className="pt-4 mt-4 border-t border-gray-700/50">
            <a 
              href="https://chat.whatsapp.com/BymCPk0L1r37IDKuNYepM4?mode=wwt" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group text-green-500 hover:bg-green-500/10 hover:text-green-400"
            >
              <span className="text-xl">💬</span>
              <span className="font-medium text-sm">Join WhatsApp</span>
            </a>
          </div>

          {/* LIGHT MODE TOGGLE */}
          <div 
            onClick={toggleTheme}
            className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group text-gray-400 hover:bg-gray-700 hover:text-white mt-2"
          >
            <div className="flex items-center gap-3">
               <span className="text-xl">{isLightMode ? '☀️' : '🌙'}</span>
               <span className="font-medium text-sm">{isLightMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isLightMode ? 'bg-blue-500' : 'bg-gray-600'}`}>
               <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${isLightMode ? 'left-[18px]' : 'left-[2px]'}`}></div>
            </div>
          </div>

          {/* LOGOUT */}
          <button 
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-700 mt-auto text-center">
          <p className="text-[10px] text-gray-500 font-mono">Zenta deals©️ 2026</p>
        </div>

      </aside>
    </>
  );
}

function NavItem({ icon, label, active, href }: any) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
        active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}>
        <span className="text-lg">{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </div>
    </Link>
  );
}
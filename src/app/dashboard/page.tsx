"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve logged-in user info stored during login
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    fetchLiveUserData(parsedUser.email);
  }, [router]);

  const fetchLiveUserData = async (email: string) => {
    try {
      const res = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        // Keep localStorage updated too
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error("Failed to fetch live profile", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || 'Agent'}!</h1>
          <p className="text-gray-400 text-xs mt-1">Manage your wallet funds and purchase data bundles instantly.</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('user');
            router.push('/login');
          }}
          className="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition"
        >
          Log Out
        </button>
      </div>

      {/* WALLET CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-950/40 via-black to-black border border-red-900/30 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute right-4 top-4 text-4xl opacity-20">💳</div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Wallet Balance</p>
          <h3 className="text-4xl font-extrabold text-white mt-2 font-mono">
            ₵{user?.balance?.toFixed(2) || "0.00"}
          </h3>
          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => fetchLiveUserData(user.email)}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-red-900/20"
            >
              🔄 Refresh Balance
            </button>
          </div>
        </div>

        <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Role</p>
            <h4 className="text-xl font-bold text-red-400 mt-1">{user?.role || "USER"}</h4>
          </div>
          <p className="text-[11px] text-gray-500">Email: {user?.email}</p>
        </div>

        <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Actions</p>
            <div className="mt-3 flex gap-2">
              <Link href="/afa" className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold px-3 py-2 rounded-xl border border-gray-700 transition">
                AFA Registration
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
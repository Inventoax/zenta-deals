"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar'; 

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          // If no user found, safely handle or redirect
          setLoading(false);
          return;
        }
        const user = JSON.parse(storedUser);
        const userId = user.id || localStorage.getItem("userId");

        if (!userId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/orders?userId=${userId}`);
        const data = await res.json();

        if (res.ok) {
          setOrders(data.orders || []);
        } else {
          setError(data.error || "Failed to load orders");
        }
      } catch (err) {
        setError("Network error loading orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex font-sans overflow-hidden">

      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen relative">
        
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
             <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
             <p className="text-gray-400 mt-1">Track your data bundle purchases.</p>
          </div>
        </header>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center text-gray-400">
            <div className="animate-spin text-3xl mb-3">⏳</div>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length > 0 ? (
          
          /* --- THE LIST (Populated Orders Table) --- */
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/30 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Reference</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-800/20 transition">
                      <td className="p-4 font-mono text-xs text-blue-400">{order.reference}</td>
                      <td className="p-4 text-gray-300">{order.description || "Data/Voucher Purchase"}</td>
                      <td className="p-4 font-bold text-white">₵{order.amount.toFixed(2)}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {order.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          order.status === 'SUCCESS' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        ) : (
          
          /* --- THE EMPTY STATE --- */
          <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in-up">
            <div className="bg-gray-800/50 p-8 rounded-full mb-6 border border-gray-700 shadow-2xl">
              <span className="text-6xl">📦</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Orders Yet</h2>
            <p className="text-gray-400 max-w-md mb-8">
              You haven't purchased any data bundles yet. 
              Once you make a purchase, it will appear here instantly.
            </p>
            
            <Link href="/buy">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-1">
                Start Shopping →
              </button>
            </Link>
          </div>

        )}

      </main>
    </div>
  );
}
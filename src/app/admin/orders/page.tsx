"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAdminOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();

        if (res.ok) {
          setOrders(data.orders || []);
        } else {
          setError(data.error || "Failed to load platform orders");
        }
      } catch (err) {
        setError("Network error loading orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const ref = order.reference?.toLowerCase() || "";
    const email = order.user?.email?.toLowerCase() || "";
    const name = order.user?.name?.toLowerCase() || "";
    return ref.includes(term) || email.includes(term) || name.includes(term);
  });

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex font-sans relative overflow-hidden">
      
      {/* Background Gradient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-rose-700/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto animate-fade-in-up">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
                Platform Orders & Transactions
              </h1>
              <p className="text-gray-400 text-sm mt-1">Monitor all user bundle purchases, voucher checkouts, and wallet adjustments.</p>
            </div>
            <Link href="/admin">
              <button className="bg-gray-900/80 hover:bg-red-950/40 text-gray-300 hover:text-red-300 px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-800 hover:border-red-500/40 transition shadow-lg transform hover:-translate-y-0.5">
                ← Back to Dashboard
              </button>
            </Link>
          </div>

          {/* Search Filter Bar */}
          <div className="mb-6">
            <input 
              type="text"
              placeholder="Search by reference, user name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96 bg-gray-950/80 border border-gray-800/80 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition shadow-inner placeholder-gray-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm animate-pulse">
              ⚠️ {error}
            </div>
          )}

          {/* Table Container */}
          {loading ? (
            <div className="text-center py-20 text-gray-400 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading platform orders...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-12 text-center text-gray-400 shadow-2xl">
              <span className="text-4xl block mb-3">📊</span>
              <p className="font-bold text-lg text-white">No transactions found</p>
              <p className="text-sm mt-1">No orders match your search or activity history is empty.</p>
            </div>
          ) : (
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/80 rounded-3xl overflow-hidden shadow-2xl transition-all">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800/80 bg-gradient-to-r from-red-950/30 to-gray-900/30 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Reference</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50 text-sm">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-red-950/10 transition-colors duration-150">
                        <td className="p-4 font-mono text-xs text-red-400 font-semibold">{order.reference}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{order.user?.name || "Unknown User"}</div>
                          <div className="text-xs text-gray-500">{order.user?.email || "No email"}</div>
                        </td>
                        <td className="p-4 text-gray-300">{order.description || "Data/Voucher Transaction"}</td>
                        <td className="p-4 font-bold text-white">₵{order.amount.toFixed(2)}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm">
                            {order.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            order.status === 'SUCCESS' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-500 font-mono">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
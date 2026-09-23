"use client";
import React, { useState } from 'react';

export default function AdminWalletManager() {
  const [email, setEmail] = useState("");
  const [action, setAction] = useState("CREDIT");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  const handleWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultMsg("");

    try {
      // First find user ID by email
      const searchRes = await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`);
      const searchData = await searchRes.json();
      
      const targetUser = searchData.user || searchData[0];
      if (!targetUser || !targetUser.id) {
        throw new Error("User with this email was not found.");
      }

      const res = await fetch("/api/admin/wallet/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUser.id,
          action,
          amount: parseFloat(amount),
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update wallet");

      setResultMsg(`Success! New balance for ${targetUser.name}: ₵${data.newBalance.toFixed(2)}`);
      setEmail("");
      setAmount("");
      setDescription("");
    } catch (err: any) {
      setResultMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-amber-500/20 p-6 rounded-3xl shadow-xl max-w-lg">
      <h3 className="text-lg font-bold text-amber-300 mb-4">Manage User Wallets</h3>
      
      <form onSubmit={handleWalletAdjustment} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">User Email</label>
          <input 
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-white text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-white text-sm outline-none"
            >
              <option value="CREDIT">Credit (+)</option>
              <option value="DEBIT">Debit (-)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Amount (₵)</label>
            <input 
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-white text-sm outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Transaction Description</label>
          <input 
            type="text"
            placeholder="e.g., Manual refund for failed bundle purchase"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-white text-sm outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl transition shadow-lg text-sm disabled:opacity-50"
        >
          {loading ? "Processing..." : `Execute ${action}`}
        </button>

        {resultMsg && (
          <div className={`p-3 rounded-xl text-xs mt-3 ${resultMsg.startsWith("Success") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
            {resultMsg}
          </div>
        )}
      </form>
    </div>
  );
}
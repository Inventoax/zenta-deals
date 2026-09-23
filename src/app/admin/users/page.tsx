"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Wallet Credit/Debit Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.error || "Failed to load users");
      }
    } catch (err) {
      setError("Network error loading users.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setError("");
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole.toUpperCase() } : u));
      } else {
        setError(data.error || "Failed to update user role");
      }
    } catch (err) {
      setError("Network error updating role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount) return;

    setModalLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: actionType, // "CREDIT" or "DEBIT"
          amount: parseFloat(amount),
          description: description || `Admin wallet ${actionType.toLowerCase()}`
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update user balance locally in state
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, balance: data.newBalance } : u));
        setSelectedUser(null);
        setAmount("");
        setDescription("");
      } else {
        setError(data.error || "Failed to update wallet balance");
      }
    } catch (err) {
      setError("Network error adjusting wallet.");
    } finally {
      setModalLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));

    const matchesRole = 
      roleFilter === "All" || 
      user.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const totalUsersCount = users.length;
  const totalBalanceSum = users.reduce((acc, u) => acc + (u.balance || 0), 0);
  const totalAgentsCount = users.filter((u) => u.role?.toLowerCase() === 'agent' || u.role?.toLowerCase() === 'admin').length;

  return (
    <div className="p-8 min-h-screen bg-[#090a0f] text-white relative">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Manage database accounts, roles, and platform balances.</p>
        </div>
        <Link href="/admin">
          <button className="bg-gray-900 hover:bg-red-950/40 text-gray-300 hover:text-red-300 font-bold py-2.5 px-5 rounded-xl border border-gray-800 hover:border-red-500/40 transition text-sm">
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
        <StatCard label="Total Users" value={loading ? "..." : totalUsersCount.toString()} icon="👥" />
        <StatCard label="Total Wallet Balance" value={loading ? "..." : `₵${totalBalanceSum.toFixed(2)}`} icon="💳" />
        <StatCard label="Active Agents / Admins" value={loading ? "..." : totalAgentsCount.toString()} icon="⚡" />
      </div>

      {/* TOOLBAR (Search & Filter) */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-4 rounded-2xl mb-6 flex flex-col md:flex-row gap-4 animate-fade-in-up">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-3.5 text-gray-500">🔍</span>
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/60 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none focus:border-red-500 transition"
          />
        </div>

        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-black/60 border border-gray-800 text-white px-6 py-3 rounded-xl text-sm outline-none focus:border-red-500 cursor-pointer"
        >
          <option value="All">All Roles</option>
          <option value="User">Users</option>
          <option value="Agent">Agents</option>
          <option value="Admin">Admins</option>
        </select>
      </div>

      {/* THE USERS TABLE */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
        
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider bg-black/50">
          <div className="col-span-3">User Info</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-2">Balance</div>
          <div className="col-span-2">Change Role</div>
          <div className="col-span-3 text-right">Actions / Wallet</div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <div className="w-6 h-6 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Loading database users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <div className="h-16 w-16 bg-gray-800/80 rounded-full flex items-center justify-center text-3xl mb-4 text-gray-500">
              👥
            </div>
            <h3 className="text-lg font-bold text-gray-300">No Users Found</h3>
            <p className="text-sm text-gray-500 mt-1">New signups will appear here automatically.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/60">
            {filteredUsers.map((user) => (
              <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-red-950/10 transition">
                
                {/* User Info */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-red-900/40 to-gray-800 flex items-center justify-center font-bold text-red-400 border border-red-500/20">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="col-span-2">
                  <p className="text-sm text-gray-300 font-mono">{user.phone || "No phone"}</p>
                  <p className="text-[10px] text-emerald-400">Database: Active</p>
                </div>

                {/* Balance */}
                <div className="col-span-2">
                  <p className="font-bold text-white text-sm">₵{user.balance?.toFixed(2) || "0.00"}</p>
                </div>

                {/* Role Switcher Action */}
                <div className="col-span-2 flex items-center gap-2">
                  <select
                    disabled={updatingId === user.id}
                    value={user.role || "USER"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`bg-black/80 border text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer transition ${
                      user.role === 'ADMIN' ? 'border-amber-500/40 text-amber-400' :
                      user.role === 'AGENT' ? 'border-red-500/40 text-red-400' :
                      'border-gray-700 text-gray-300'
                    } disabled:opacity-50`}
                  >
                    <option value="USER">USER</option>
                    <option value="AGENT">AGENT</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  {updatingId === user.id && (
                    <span className="text-[10px] text-gray-400 animate-pulse">Saving...</span>
                  )}
                </div>

                {/* Wallet Credit/Debit Trigger */}
                <div className="col-span-3 text-right">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-lg shadow-red-900/10"
                  >
                    Manage Wallet
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- WALLET CREDIT / DEBIT MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-[#111] border border-gray-800 p-6 rounded-3xl w-full max-w-md shadow-2xl relative">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Adjust User Wallet</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-white font-bold text-sm bg-gray-900 p-2 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/40 p-3.5 rounded-xl border border-gray-800 mb-6 space-y-1">
              <p className="text-xs text-gray-400">Target User: <span className="text-white font-bold">{selectedUser.name}</span></p>
              <p className="text-xs text-gray-400">Email: <span className="text-gray-300 font-mono">{selectedUser.email}</span></p>
              <p className="text-xs text-gray-400">Current Balance: <span className="text-emerald-400 font-bold font-mono">₵{selectedUser.balance?.toFixed(2)}</span></p>
            </div>

            <form onSubmit={handleWalletAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Action Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType("CREDIT")}
                    className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                      actionType === 'CREDIT' 
                        ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-black/40 text-gray-500 border-gray-800'
                    }`}
                  >
                    + Credit Funds
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType("DEBIT")}
                    className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                      actionType === 'DEBIT' 
                        ? 'bg-red-600/20 text-red-400 border-red-500/40' 
                        : 'bg-black/40 text-gray-500 border-gray-800'
                    }`}
                  >
                    - Debit Funds
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount (₵)</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Reason / Description</label>
                <input 
                  type="text"
                  placeholder="e.g. Manual wallet funding via bank transfer"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className={`w-full mt-2 py-3.5 rounded-xl text-xs font-bold uppercase transition shadow-lg ${
                  actionType === 'CREDIT' 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
                } disabled:opacity-50`}
              >
                {modalLoading ? "Processing..." : `Confirm ${actionType}`}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-extrabold text-white mt-1">{value}</h3>
      </div>
      <div className="h-12 w-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 text-xl border border-red-500/20 shadow-inner">
        {icon}
      </div>
    </div>
  );
}
"use client";
import React, { useState, useEffect } from 'react';

export default function BuyDataPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [userRole, setUserRole] = useState("CUSTOMER");
  const [userId, setUserId] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch plans created by Admin
    fetch("/api/data-plans")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPlans(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching plans:", err);
        setLoading(false);
      });

    // Check logged-in user details from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role) setUserRole(parsed.role);
        if (parsed.id) setUserId(parsed.id);
      } catch (e) {
        // fallback
      }
    }
  }, []);

  const filteredPlans = selectedNetwork === "ALL" 
    ? plans 
    : plans.filter(p => p.network.toUpperCase().includes(selectedNetwork.toUpperCase()));

  const handleOpenCheckout = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      alert("Please enter your phone number");
      return;
    }

    const currentUserId = userId || localStorage.getItem("userId") || "mock_user_id";

    setSubmitting(true);
    try {
      const res = await fetch("/api/data-plans/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          planId: selectedPlan.id,
          phone: phone,
          isAgent: userRole === "AGENT"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || "Purchase failed");
      }

      alert(`🎉 Success! ${data.message}\nNew Balance: ₵${data.newBalance.toFixed(2)}`);
      setIsModalOpen(false);
      setPhone("");
      
      // Update local stored balance
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          u.balance = data.newBalance;
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch (err) {
        console.error("Failed to update local user balance", err);
      }

    } catch (err: any) {
      alert(`Purchase Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to assign specific network badge color styles
  const getNetworkStyle = (networkName: string) => {
    const net = (networkName || "").toUpperCase();
    if (net.includes("MTN")) {
      return "bg-amber-500/10 text-amber-300 border-amber-500/20";
    }
    if (net.includes("TELECEL")) {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }
    if (net.includes("AT") || net.includes("AIRTEL")) {
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  return (
    <div className="p-6 md:p-10 bg-[#0c0f17] min-h-screen text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-amber-500/20 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Zenta Deals Store
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Account Type: <span className="text-amber-400 font-bold uppercase tracking-wider">{userRole}</span> 
            {userRole === "AGENT" && <span className="ml-2 text-xs bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">Wholesale Active</span>}
          </p>
        </div>
      </div>

      {/* Network Filter Buttons */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {["ALL", "MTN", "Telecel", "AT"].map((net) => (
          <button
            key={net}
            onClick={() => setSelectedNetwork(net)}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md ${
              selectedNetwork === net 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold shadow-amber-500/20 shadow-lg scale-105' 
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {net}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400"></div>
          <span className="ml-3 text-slate-400 text-sm">Loading live packages...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const priceToDisplay = userRole === "AGENT" ? plan.agentPrice : plan.customerPrice;
            const badgeStyle = getNetworkStyle(plan.network);

            return (
              <div 
                key={plan.id} 
                className="group relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-500/10 hover:border-amber-500/40 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border tracking-wider ${badgeStyle}`}>
                      {plan.network}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                      {plan.validity || "Non Expiry"}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-100 mb-1 group-hover:text-amber-300 transition">{plan.name}</h3>
                  <p className="text-slate-400 text-xs mb-5 leading-relaxed">{plan.description || "Instant delivery high-speed data bundle"}</p>

                  <div className="bg-slate-950 p-4 rounded-xl mb-6 border border-slate-800/80 flex justify-between items-center shadow-inner">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-0.5">Price</span>
                      <div className="text-2xl font-black text-amber-400">
                        ₵{priceToDisplay?.toFixed(2)}
                      </div>
                    </div>
                    {userRole === "AGENT" && (
                      <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        Agent Tier
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handleOpenCheckout(plan)}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold py-3 rounded-xl transition-all shadow-lg shadow-amber-600/20 text-sm tracking-wide"
                >
                  Buy Package Now
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredPlans.length === 0 && (
        <div className="text-center py-24 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-base font-medium">No data packages available for this category.</p>
          <p className="text-xs text-slate-500 mt-1">Check back soon or add packages from your admin panel.</p>
        </div>
      )}

      {/* Checkout Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/30 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl shadow-amber-500/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-amber-300">Confirm Order</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Package:</span>
                <span className="text-slate-200 font-bold">{selectedPlan.name} ({selectedPlan.network})</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Price:</span>
                <span className="text-amber-400 font-black text-sm">₵{(userRole === "AGENT" ? selectedPlan.agentPrice : selectedPlan.customerPrice).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Recipient Phone Number</label>
                <input 
                  type="tel"
                  placeholder="e.g. 0241234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3.5 text-white text-sm outline-none transition shadow-inner"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold py-3 rounded-xl transition shadow-lg shadow-amber-600/20 text-sm disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950 mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Confirm & Pay"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";
import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [network, setNetwork] = useState("MTN");
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [customerPrice, setCustomerPrice] = useState("");
  const [agentPrice, setAgentPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCustomerPrice, setEditCustomerPrice] = useState("");
  const [editAgentPrice, setEditAgentPrice] = useState("");

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/data-plans");
      const data = await res.json();
      if (Array.isArray(data)) setPlans(data);
    } catch (err) {
      console.error("Failed to fetch plans", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/data-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network,
          name,
          size,
          customerPrice: parseFloat(customerPrice),
          agentPrice: parseFloat(agentPrice),
          active: true,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Data plan added successfully!");
        setName("");
        setSize("");
        setCustomerPrice("");
        setAgentPrice("");
        fetchPlans();
      } else {
        alert(result.error || "Failed to add plan");
      }
    } catch (error) {
      console.error("Error adding plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/data-plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPrice: parseFloat(editCustomerPrice),
          agentPrice: parseFloat(editAgentPrice),
        }),
      });

      if (res.ok) {
        alert("Prices updated successfully!");
        setEditingId(null);
        fetchPlans();
      } else {
        alert("Failed to update prices");
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const res = await fetch(`/api/admin/data-plans/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchPlans();
      } else {
        alert("Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  return (
    <div className="p-8 bg-[#0f172a] min-h-screen text-white font-sans">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard: Role-Based Pricing Manager</h1>

      <form onSubmit={handleAddPlan} className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl mb-10 max-w-2xl shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Add New Data Package</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Network</label>
            <select 
              value={network} 
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none"
            >
              <option value="MTN">MTN</option>
              <option value="Telecel">Telecel</option>
              <option value="AT">AT</option>
              <option value="AT BigTime">AT BigTime</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Package Name</label>
            <input 
              type="text" 
              placeholder="MTN 1GB Monthly" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Size in GB</label>
            <input 
              type="text" 
              placeholder="1" 
              value={size} 
              onChange={(e) => setSize(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Regular Customer Price (₵)</label>
            <input 
              type="number" 
              step="0.01" 
              placeholder="15.00" 
              value={customerPrice} 
              onChange={(e) => setCustomerPrice(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Agent Wholesale Price (₵)</label>
            <input 
              type="number" 
              step="0.01" 
              placeholder="12.50" 
              value={agentPrice} 
              onChange={(e) => setAgentPrice(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-3 rounded-xl transition shadow-lg"
        >
          {loading ? "Adding..." : "Add Plan to Database"}
        </button>
      </form>

      <h2 className="text-xl font-bold mb-4">Manage Role Prices & Packages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-gray-800/50 border border-gray-700 p-5 rounded-xl shadow-md flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg text-white">{plan.network} - {plan.size}GB</span>
                <button 
                  onClick={() => handleDelete(plan.id)}
                  className="text-red-400 hover:text-red-300 text-xs bg-red-500/10 px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">{plan.name}</p>

              {editingId === plan.id ? (
                <div className="space-y-3 bg-gray-900/80 p-3 rounded-xl border border-blue-500/50 mb-4">
                  <div>
                    <label className="text-xs text-blue-300 block mb-1">Customer Price (₵)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editCustomerPrice} 
                      onChange={(e) => setEditCustomerPrice(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-green-300 block mb-1">Agent Price (₵)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editAgentPrice} 
                      onChange={(e) => setEditAgentPrice(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => handleSaveEdit(plan.id)}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-xs py-2 rounded font-bold"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-xs py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-900/40 p-3 rounded-xl">
                  <div>
                    <span className="text-xs text-gray-400 block">Customer</span>
                    <span className="text-blue-400 font-bold text-lg">₵{plan.customerPrice?.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Agent</span>
                    <span className="text-green-400 font-bold text-lg">₵{plan.agentPrice?.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {editingId !== plan.id && (
              <button 
                onClick={() => {
                  setEditingId(plan.id);
                  setEditCustomerPrice(plan.customerPrice);
                  setEditAgentPrice(plan.agentPrice);
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-sm font-semibold py-2 rounded-lg transition"
              >
                Edit Role Prices
              </button>
            )}
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <p className="text-gray-400">No data plans found in the database. Add one above to get started.</p>
      )}
    </div>
  );
}
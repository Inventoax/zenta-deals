"use client";
import React, { useState, useEffect } from 'react';

export default function AdminAFAPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Global counts so they never reset to 0 based on tab/search filtering
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchRequests();
    fetchGlobalCounts();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/afa?status=${filter}`);
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Failed to load AFA requests", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalCounts = async () => {
    try {
      // Fetch all statuses to calculate exact total counters
      const [pendRes, apprRes, rejRes] = await Promise.all([
        fetch("/api/afa?status=PENDING"),
        fetch("/api/afa?status=APPROVED"),
        fetch("/api/afa?status=REJECTED"),
      ]);

      const [pendData, apprData, rejData] = await Promise.all([
        pendRes.json(),
        apprRes.json(),
        rejRes.json(),
      ]);

      setCounts({
        pending: pendData.requests?.length || 0,
        approved: apprData.requests?.length || 0,
        rejected: rejData.requests?.length || 0,
      });
    } catch (err) {
      console.error("Failed to fetch global counts", err);
    }
  };

  const handleAction = async (requestId: string, status: string) => {
    setActionLoading(requestId);
    try {
      const res = await fetch("/api/afa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });

      if (res.ok) {
        fetchRequests(); 
        fetchGlobalCounts(); // Refresh counts after status update
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter requests locally based on the search query (Name, Ghana Card, or City/Town)
  const filteredRequests = requests.filter((req) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = req.fullName?.toLowerCase().includes(query);
    const cardMatch = req.ghanaCardId?.toLowerCase().includes(query);
    const regionMatch = req.region?.toLowerCase().includes(query);
    return nameMatch || cardMatch || regionMatch;
  });

  return (
    <div className="p-8 min-h-screen bg-[#090a0f] text-white">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AFA Requests</h1>
          <p className="text-gray-400 mt-1">Verify agent identities and Ghana Card submissions.</p>
        </div>
        <div className="flex gap-2">
           <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-bold">
             Live Database Connected
           </span>
        </div>
      </div>

      {/* STATS ROW (Always show actual overall counts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
        <StatCard label="Pending Review" value={counts.pending.toString()} color="text-orange-400" border="border-orange-500/20" />
        <StatCard label="Approved Agents" value={counts.approved.toString()} color="text-green-400" border="border-gray-800" />
        <StatCard label="Rejected" value={counts.rejected.toString()} color="text-red-400" border="border-gray-800" />
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-800 animate-fade-in-up">
        {/* Status Tab Filters */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
          <FilterTab label="Pending" count={counts.pending} active={filter === 'PENDING'} onClick={() => setFilter('PENDING')} />
          <FilterTab label="Approved" count={counts.approved} active={filter === 'APPROVED'} onClick={() => setFilter('APPROVED')} />
          <FilterTab label="Rejected" count={counts.rejected} active={filter === 'REJECTED'} onClick={() => setFilter('REJECTED')} />
        </div>

        {/* Live Search Input */}
        <div className="w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search by name, card, or city..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* THE REQUESTS GRID */}
      {loading ? (
        <div className="flex justify-center items-center py-24 text-gray-400 gap-3">
          <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Loading applications...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
          <div className="h-20 w-20 bg-gray-800/50 rounded-full flex items-center justify-center text-4xl mb-4 grayscale opacity-50">
            🔍
          </div>
          <h3 className="text-lg font-bold text-gray-300">No requests found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            {searchQuery ? `No matches found for "${searchQuery}"` : `There are no ${filter.toLowerCase()} requests at the moment.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
           {filteredRequests.map((req) => (
             <div key={req.id} className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono text-gray-500">ID: {req.id.slice(0, 8)}...</span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                      req.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      req.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{req.fullName}</h3>
                  <p className="text-xs text-blue-400 font-mono mt-1">🇬🇭 {req.ghanaCardId}</p>

                  <div className="mt-4 space-y-1.5 text-xs text-gray-300 bg-black/40 p-3.5 rounded-xl border border-gray-800/80">
                    <p className="flex justify-between"><span className="text-gray-500">City / Town:</span> <span className="font-medium text-white">{req.region}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-mono text-blue-300">{req.phone || "N/A"}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="text-gray-300">{req.email || "N/A"}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Submitted:</span> <span className="text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span></p>
                  </div>
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex gap-2 mt-6">
                    <button 
                      disabled={actionLoading === req.id}
                      onClick={() => handleAction(req.id, 'APPROVED')}
                      className="flex-1 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/30 font-bold py-2.5 rounded-xl transition text-xs disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button 
                      disabled={actionLoading === req.id}
                      onClick={() => handleAction(req.id, 'REJECTED')}
                      className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-bold py-2.5 rounded-xl transition text-xs disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
             </div>
           ))}
        </div>
      )}

    </div>
  );
}

function StatCard({ label, value, color, border }: any) {
  return (
    <div className={`bg-gray-900/40 backdrop-blur-xl border ${border} p-6 rounded-2xl shadow-xl`}>
      <p className="text-gray-500 text-xs font-bold uppercase">{label}</p>
      <h3 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h3>
    </div>
  );
}

function FilterTab({ label, count, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 text-xs md:text-sm font-bold transition flex items-center gap-2 rounded-xl ${
        active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white bg-gray-900/40 border border-gray-800'
      }`}
    >
      {label}
      <span className="bg-black/40 text-xs px-2 py-0.5 rounded-md text-gray-300">{count}</span>
    </button>
  );
}
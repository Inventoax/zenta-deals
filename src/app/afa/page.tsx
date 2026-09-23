"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function AFAPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [referenceId, setReferenceId] = useState("");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ghanaCardId, setGhanaCardId] = useState("");
  const [region, setRegion] = useState(""); // Changed from default region to empty string for town/city input

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/afa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          ghanaCardId,
          region,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setReferenceId(data.request.id);
        setStatus("success");
      } else {
        setErrorMessage(data.error || "Failed to submit application");
      }
    } catch (err) {
      setErrorMessage("Network error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex font-sans overflow-hidden">
      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen relative">
        
        <header className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-white mb-4 inline-flex items-center gap-2 transition text-sm">
            <span>←</span> Back to Dashboard
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AFA Registration</h1>
              <p className="text-gray-400 mt-1">Submit your details for Authorized Field Agent processing.</p>
            </div>
            <div className="h-12 w-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center text-2xl border border-blue-500/30">
              📝
            </div>
          </div>
        </header>

        {errorMessage && (
          <div className="max-w-3xl mx-auto mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
            ⚠️ {errorMessage}
          </div>
        )}

        {status === 'success' ? (
           <div className="bg-green-500/10 border border-green-500/50 rounded-2xl p-12 text-center animate-fade-in-up max-w-3xl mx-auto">
             <div className="h-20 w-20 bg-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 text-black font-bold shadow-lg">✓</div>
             <h2 className="text-3xl font-bold text-white mb-2">Application Received!</h2>
             <p className="text-gray-400 text-lg">Your information has been successfully sent to administration.</p>
             <p className="text-gray-500 text-sm mt-2">Reference ID: <span className="font-mono text-green-400">{referenceId}</span></p>
             <button onClick={() => setStatus('idle')} className="mt-8 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl transition">Submit Another</button>
           </div>
        ) : (

        <div className="max-w-3xl mx-auto bg-gray-800/40 backdrop-blur-md border border-gray-700 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
          
          <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 mb-8 flex gap-4">
             <span className="text-2xl">🆔</span>
             <p className="text-sm text-blue-200 leading-relaxed">
               <strong>Public Registration:</strong> Provide accurate information and your Ghana Card details. Our team will review your submission.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Full Name (As on Ghana Card)</label>
              <input 
                type="text" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 px-4 text-white outline-none focus:border-blue-500 transition" 
                placeholder="Kwame Mensah" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Phone Number</label>
                <input 
                  type="text" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 px-4 text-white outline-none focus:border-blue-500 transition font-mono" 
                  placeholder="0241234567" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Email Address (Optional)</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 px-4 text-white outline-none focus:border-blue-500 transition" 
                  placeholder="kwame@example.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Ghana Card Number (NIA)</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500">🇬🇭</span>
                <input 
                  type="text" 
                  required 
                  value={ghanaCardId}
                  onChange={(e) => setGhanaCardId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500 transition font-mono" 
                  placeholder="GHA-123456789-0" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">City / Town of Operation</label>
              <input 
                type="text" 
                required 
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 px-4 text-white outline-none focus:border-blue-500 transition" 
                placeholder="e.g. Ablekuma, Accra" 
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition transform hover:-translate-y-1 mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>

          </form>
        </div>
        )}

      </main>
    </div>
  );
}
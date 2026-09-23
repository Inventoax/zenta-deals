"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar'; 

export default function SubmitNumbersPage() {
  const [textInput, setTextInput] = useState("");
  const [validCount, setValidCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | success

  // LIMITS
  const MAX_NUMBERS = 30;

  // --- LOGIC: LIVE VALIDATOR ---
  useEffect(() => {
    // 1. Split text by new lines, commas, or spaces
    const lines = textInput.split(/[\n, ]+/).filter(line => line.trim() !== "");
    
    // 2. Count how many look like valid Ghana numbers (Starts with 0 or 233, length 9-13)
    const validOnes = lines.filter(num => {
      const clean = num.replace(/\D/g, ''); // Remove non-digits
      return (clean.startsWith('0') || clean.startsWith('233')) && clean.length >= 10;
    });

    setValidCount(validOnes.length);
  }, [textInput]);


  // --- LOGIC: SUBMIT ---
  const handleSubmit = async () => {
    if (validCount === 0) return;
    setLoading(true);

    // SIMULATION: Sending to API
    setTimeout(() => {
      setLoading(false);
      setStatus("success");
      setTextInput(""); // Clear form
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex font-sans overflow-hidden">

      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen relative">
        
        {/* HEADER */}
        <header className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-white mb-4 inline-flex items-center gap-2 transition text-sm">
            <span>←</span> Back to Dashboard
          </Link>
          <div className="flex justify-between items-end">
             <h1 className="text-3xl font-bold tracking-tight">Submit Numbers</h1>
             <div className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
               🔔
             </div>
          </div>
        </header>

        {/* SUCCESS MESSAGE */}
        {status === 'success' ? (
           <div className="max-w-2xl bg-green-500/10 border border-green-500/50 rounded-2xl p-8 text-center animate-fade-in-up">
             <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-black font-bold">✓</div>
             <h2 className="text-2xl font-bold text-white mb-2">Numbers Submitted!</h2>
             <p className="text-gray-400">Your list has been sent for approval.</p>
             <button onClick={() => setStatus('idle')} className="mt-6 text-green-400 font-bold hover:underline">Submit More</button>
           </div>
        ) : (

        /* --- THE FORM CARD --- */
        <div className="max-w-2xl bg-gray-800/40 backdrop-blur-md border border-gray-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Submit Numbers for Approval</h2>
              <p className="text-gray-400 text-sm mt-1 max-w-sm">
                Paste up to {MAX_NUMBERS} Ghana phone numbers to add them to the beneficiary list.
                Separate numbers with commas or new lines.
              </p>
            </div>
          </div>

          {/* Input Label & Counter */}
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-gray-300">Phone numbers <span className="text-red-500">*</span></label>
            <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
              validCount > MAX_NUMBERS ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'
            }`}>
              {validCount} / {MAX_NUMBERS} valid
            </span>
          </div>

          {/* Text Area */}
          <textarea 
            className="w-full h-48 bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white font-mono text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none placeholder-gray-600"
            placeholder={`0241234567\n0551234569\n0538122730`}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          ></textarea>

          {/* Footer Info */}
          <p className="text-xs text-gray-500 mt-3 mb-8">
            Accepted formats: 0241234567, 233241234567, or +233241234567
          </p>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={validCount === 0 || validCount > MAX_NUMBERS || loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
              (validCount === 0 || validCount > MAX_NUMBERS) 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white hover:-translate-y-1 shadow-blue-900/20'
            }`}
          >
            {loading ? (
              <>Processing...</>
            ) : validCount > MAX_NUMBERS ? (
              <>Too many numbers ({validCount})</>
            ) : (
              <>📋 Submit {validCount > 0 ? `${validCount} Numbers` : 'Numbers'}</>
            )}
          </button>

          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] -z-10 pointer-events-none"></div>

        </div>
        )}

      </main>
    </div>
  );
}
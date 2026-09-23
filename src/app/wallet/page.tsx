"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation'; // <--- New imports
import Sidebar from '../../components/Sidebar'; 

export default function WalletPage() {
  const [amount, setAmount] = useState<string>("");
  const [balance, setBalance] = useState(0.00); // Now dynamic!
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Tools to read URL
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference'); // Did we just come back from Paystack?

  // 1. VERIFICATION LOGIC (Runs automatically on return)
  useEffect(() => {
    if (reference) {
      verifyTransaction(reference);
    }
  }, [reference]);

  const verifyTransaction = async (ref: string) => {
    setVerifying(true);
    try {
      const res = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`✅ Payment Verified! New Balance: ₵${data.newBalance.toFixed(2)}`);
        setBalance(data.newBalance); // Update UI instantly
        // Clean URL (Remove the ?reference=... so it doesn't run again)
        router.replace('/wallet');
      } else {
        alert("Verification Failed: " + data.error);
      }
    } catch (err) {
      alert("Verification Error");
    } finally {
      setVerifying(false);
    }
  };

  // 2. PAYMENT LOGIC
  const numericAmount = parseFloat(amount) || 0;
  const fee = numericAmount * 0.02;
  const total = numericAmount + fee;

  const initiatePayment = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      const res = await fetch('/api/paystack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: "agent@zentadeals.com", // ⚠️ Must match a real user email in your DB!
          amount: numericAmount, 
        }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert("Error: " + data.error);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex font-sans overflow-hidden">

      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen relative">
        
        {/* HEADER */}
        <header className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-white mb-4 inline-flex items-center gap-2 transition text-sm"><span>←</span> Back</Link>
          <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
        </header>

        {/* VERIFICATION LOADER */}
        {verifying && (
          <div className="bg-blue-600 text-white p-4 rounded-xl mb-6 flex items-center justify-center gap-3 animate-pulse shadow-lg">
             <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
             <span className="font-bold">Verifying Payment with Paystack... Please wait.</span>
          </div>
        )}

        {/* BALANCE CARD (Dynamic) */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 border border-blue-800/50 rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 font-medium mb-2">Current Balance</p>
            <h2 className="text-5xl font-bold text-white tracking-tight">₵{balance.toFixed(2)}</h2>
          </div>
        </div>

        {/* TOP UP FORM */}
        <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700 rounded-2xl p-6 md:p-8 mb-8 max-w-2xl">
          <h3 className="text-xl font-bold mb-6">Fund Wallet</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-300 mb-2">Amount (₵)</label>
            <input 
              type="number" 
              placeholder="50.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl py-4 px-4 text-white text-xl font-bold outline-none focus:border-blue-500"
            />
          </div>

          {/* FEE BREAKDOWN */}
          {numericAmount > 0 && (
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 mb-6 text-sm space-y-2">
              <div className="flex justify-between"><span>Credit:</span><span className="font-bold">₵{numericAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-yellow-400"><span>Fee (2%):</span><span>+ ₵{fee.toFixed(2)}</span></div>
              <div className="border-t border-blue-800/50 pt-2 flex justify-between font-bold text-lg"><span>Pay:</span><span>₵{total.toFixed(2)}</span></div>
            </div>
          )}

          <button 
            onClick={initiatePayment}
            disabled={!amount || loading || verifying}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${!amount ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            {loading ? 'Redirecting...' : `Pay ₵${total.toFixed(2)}`}
          </button>
        </div>

      </main>
    </div>
  );
}
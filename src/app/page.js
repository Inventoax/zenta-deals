"use client";
import { useState } from "react";

export default function Home() {
  // Local UI State Tracking
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [network, setNetwork] = useState("MTN");
  const [dataSize, setDataSize] = useState("1");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // 💳 Form Action: Fund Account via Paystack Gateway
  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!topUpAmount || Number(topUpAmount) <= 0) return alert("Please enter a valid amount");
    setLoading(true);
    try {
      const response = await fetch("/api/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "mock-user-id", // Temporary placeholder until authentication is added
          email: "customer@zentadeals.com",
          amount: topUpAmount,
        }),
      });
      const resData = await response.json();
      if (resData.success && resData.authorization_url) {
        window.location.href = resData.authorization_url; // Redirect straight to Paystack checkout screen
      } else {
        alert(resData.error || "Payment gateway connection failed");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred initializing payment");
    } finally {
      setLoading(false);
    }
  };

  // 📶 Form Action: Forward Bundle Order to Inventor Datahub API
  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return alert("Please enter a recipient phone number");
    setLoading(true);
    
    // Simple dynamic pricing logic (e.g., ₵10 per 1GB)
    const bundlePrice = Number(dataSize) * 10;

    try {
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "mock-user-id",
          network,
          phone: phoneNumber,
          dataSize,
          price: bundlePrice,
        }),
      });
      const resData = await response.json();
      alert(resData.message || resData.error);
    } catch (err) {
      console.error(err);
      alert("An error occurred during bundle execution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Navbar & Branding */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-extrabold text-blue-500 tracking-wide">ZENTA DEALS</h1>
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-sm block">Wallet Balance</span>
            <span className="text-xl font-bold text-emerald-400">₵{walletBalance.toFixed(2)}</span>
          </div>
        </header>

        {/* Dashboard Grid Options */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Section: Paystack Top-Up Card */}
          <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-200">💳 Fund Your Wallet</h2>
            <form onSubmit={handleTopUp} className="space-y-3">
              <label className="text-sm text-slate-400 block">Amount (GHC)</label>
              <input 
                type="number" 
                placeholder="e.g. 50" 
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 transition py-3 rounded-xl font-bold text-white tracking-wide"
              >
                {loading ? "Processing Secure Gateway..." : "Initialize Deposit"}
              </button>
            </form>
          </section>

          {/* Section: Bundle Vending Form */}
          <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-slate-200">📶 Purchase Data Bundle</h2>
            <form onSubmit={handlePurchase} className="space-y-3">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Network</label>
                  <select 
                    value={network} 
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="MTN">MTN</option>
                    <option value="AT ISHARE">AT ISHARE</option>
                    <option value="TELECEL">TELECEL</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Data Size</label>
                  <select 
                    value={dataSize} 
                    onChange={(e) => setDataSize(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="1">1 GB (₵10)</option>
                    <option value="5">5 GB (₵50)</option>
                    <option value="10">10 GB (₵100)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-1">Recipient Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 0541234567" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 transition py-3 rounded-xl font-bold text-white tracking-wide"
              >
                {loading ? "Routing to Network..." : "Buy Bundle Now"}
              </button>
            </form>
          </section>

        </div>

      </div>
    </main>
  );
}
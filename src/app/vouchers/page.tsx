"use client";
import React, { useState, useEffect } from 'react';

export default function BuyVouchersPage() {
  const [voucherProducts, setVoucherProducts] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("BECE");
  const [quantity, setQuantity] = useState(1);
  const [recipient, setRecipient] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);

  useEffect(() => {
    // Fetch live voucher products and pricing from backend
    fetch("/api/admin/vouchers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVoucherProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load voucher pricing", err);
        setLoading(false);
      });

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.id) setUserId(parsed.id);
      } catch (e) {}
    }
  }, []);

  // Find the active product config based on selection (BECE / WASSCE)
  const currentProduct = voucherProducts.find(
    (p) => p.type.toUpperCase() === selectedType.toUpperCase()
  ) || { price: 15.00, name: `${selectedType} Checker` };

  const unitPrice = currentProduct.price || 15.00;
  const totalCost = unitPrice * quantity;

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) {
      alert("Please enter a recipient phone number");
      return;
    }

    const currentUserId = userId || localStorage.getItem("userId") || "mock_user_id";

    setSubmitting(true);
    setSuccessResult(null);

    try {
      const res = await fetch("/api/vouchers/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          voucherType: selectedType,
          recipient,
          quantity: Number(quantity),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || "Voucher purchase failed");
      }

      setSuccessResult(data);

      // Update local stored balance
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          u.balance = data.newBalance;
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch (err) {}

    } catch (err: any) {
      alert(`Voucher Purchase Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-[#0c0f17] min-h-screen text-slate-100 font-sans max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="mb-8 border-b border-amber-500/20 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
          Result Checker Vouchers
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Purchase BECE & WASSCE checker cards instantly at official rates. Pins and serials are sent via SMS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Purchase Form */}
        <div className="bg-slate-900/90 border border-amber-500/20 p-6 md:p-8 rounded-3xl shadow-xl">
          <h2 className="text-xl font-bold text-amber-300 mb-6">Order Vouchers</h2>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading live pricing...</div>
          ) : (
            <form onSubmit={handlePurchase} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Voucher Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {["BECE", "WASSCE"].map((type) => {
                    const prod = voucherProducts.find(p => p.type.toUpperCase() === type);
                    const pPrice = prod ? prod.price : 15.00;
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`py-3 px-2 rounded-xl font-bold text-sm transition border flex flex-col items-center justify-center ${
                          selectedType === type
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{type} Checker</span>
                        <span className={`text-[11px] font-mono mt-0.5 ${selectedType === type ? 'text-slate-900 font-black' : 'text-amber-400'}`}>
                          ₵{pPrice.toFixed(2)} each
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Quantity (1 - 10)</label>
                <input 
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  required
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3.5 text-white text-sm outline-none transition shadow-inner font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Recipient Phone Number (For SMS)</label>
                <input 
                  type="tel"
                  placeholder="e.g. 0241234567"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3.5 text-white text-sm outline-none transition shadow-inner font-mono"
                />
              </div>

              {/* Dynamic Price Breakdown Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Unit Price:</span>
                  <span className="text-slate-200 font-mono">₵{unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-800/80">
                  <span className="text-slate-300">Total to Pay:</span>
                  <span className="text-amber-400 font-mono text-base">₵{totalCost.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-amber-600/20 text-sm disabled:opacity-50 flex items-center justify-center mt-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950 mr-2"></div>
                    Processing Order...
                  </>
                ) : (
                  `Pay ₵${totalCost.toFixed(2)} & Get Voucher`
                )}
              </button>
            </form>
          )}
        </div>

        {/* Results / Success Display Panel */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-200 mb-4">Purchase Summary & Codes</h3>
            
            {successResult ? (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-xs leading-relaxed">
                  {successResult.message}
                </div>

                <div className="space-y-3">
                  {successResult.vouchers?.map((v: any, index: number) => (
                    <div key={v.id || index} className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Serial: <strong className="text-slate-200 font-mono">{v.serial}</strong></span>
                        <span className="text-amber-400 font-mono">₵{v.price?.toFixed(2)}</span>
                      </div>
                      <div className="text-sm font-mono text-amber-300 font-bold">
                        PIN: {v.pin} {v.code ? `(${v.code})` : ""}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
                  <span>Updated Wallet Balance:</span>
                  <span className="text-amber-400 font-bold font-mono">₵{successResult.newBalance?.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-sm">
                <p>Your purchased voucher codes, serials, and PIN details will appear right here after a successful transaction.</p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 mt-6 pt-4 border-t border-slate-800/80">
            Prices update dynamically based on your admin configurations.
          </div>
        </div>
      </div>
    </div>
  );
}
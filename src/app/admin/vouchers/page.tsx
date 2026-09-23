"use client";
import React, { useState, useEffect } from 'react';

export default function AdminVouchersPage() {
  const [provider, setProvider] = useState("External Vendor API");
  const [apiBalance, setApiBalance] = useState(0.00); 
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. EDITING & ADDING LOGIC
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempData, setTempData] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", type: "E-PIN", cost: 0, price: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vouchers");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to load vouchers", err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setTempData(product);
  };

  const saveEdit = async () => {
    try {
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempData),
      });
      if (res.ok) {
        setEditingId(null);
        fetchProducts();
      } else {
        alert("Failed to update product");
      }
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        setIsAdding(false);
        setNewProduct({ name: "", type: "E-PIN", cost: 0, price: 0 });
        fetchProducts();
      } else {
        alert("Failed to add product");
      }
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[#090a0f] text-white">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Voucher API Gateway</h1>
          <p className="text-gray-400 mt-1">Manage external provider and pricing margins.</p>
        </div>
        
        {/* API STATUS */}
        <div className="flex items-center gap-3 bg-[#111] border border-gray-800 px-4 py-2 rounded-xl">
          <div className="flex flex-col text-right">
             <span className="text-[10px] text-gray-500 uppercase font-bold">Provider Status</span>
             <span className="text-green-400 text-xs font-bold flex items-center justify-end gap-1">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
             </span>
          </div>
          <div className="h-8 w-[1px] bg-gray-800"></div>
          <div className="flex flex-col">
             <span className="text-[10px] text-gray-500 uppercase font-bold">API Wallet</span>
             <span className="text-white text-sm font-bold">₵{apiBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* --- SECTION 1: CONFIGURATION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in-up">
        
        <div className="lg:col-span-2 bg-[#1a0505] border border-red-900/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
             <div>
               <h3 className="text-lg font-bold text-white">Provider Configuration</h3>
               <p className="text-sm text-gray-400">Credentials for the external voucher source.</p>
             </div>
             <span className="text-red-400 text-xs font-mono">agent.inventor-datahub.com</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Active Provider</label>
              <div className="bg-black/50 border border-gray-800 p-3 rounded-lg text-white font-mono text-sm flex items-center gap-2">
                🌐 {provider}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">API Key</label>
              <div className="bg-black/50 border border-gray-800 p-3 rounded-lg text-gray-500 font-mono text-sm">
                sk_live_********************
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <StatBox label="Total Sold Today" value="0" icon="🎟️" />
          <StatBox label="Est. Profit" value="₵0.00" icon="📈" />
          <StatBox label="Failed Requests" value="0" icon="⚠️" color="text-red-400" />
        </div>

      </div>

      {/* --- SECTION 2: EDITABLE PRICING --- */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Product Pricing Control</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-red-900/20"
        >
          {isAdding ? 'Cancel' : '+ Add New Voucher Type'}
        </button>
      </div>

      {/* Add New Product Form Modal/Card */}
      {isAdding && (
        <form onSubmit={handleAddProduct} className="bg-[#111] border border-red-500/30 p-6 rounded-2xl mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end animate-fade-in-up">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Voucher Name</label>
            <input 
              type="text" 
              placeholder="e.g. WAEC Checker"
              required
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              className="w-full bg-black border border-gray-700 rounded-xl p-2.5 text-sm text-white outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Cost Price (₵)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={newProduct.cost}
              onChange={(e) => setNewProduct({...newProduct, cost: parseFloat(e.target.value)})}
              className="w-full bg-black border border-gray-700 rounded-xl p-2.5 text-sm text-white outline-none focus:border-red-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Selling Price (₵)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
              className="w-full bg-black border border-gray-700 rounded-xl p-2.5 text-sm text-white outline-none focus:border-red-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Type</label>
            <input 
              type="text" 
              value={newProduct.type}
              onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}
              className="w-full bg-black border border-gray-700 rounded-xl p-2.5 text-sm text-white outline-none focus:border-red-500"
            />
          </div>
          <div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-xs transition">
              Save Product
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden animate-fade-in-up">
        
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider bg-black/50">
          <div className="col-span-4">Voucher Type</div>
          <div className="col-span-2">Cost (API)</div>
          <div className="col-span-2">Selling Price</div>
          <div className="col-span-2">Profit Margin</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading products from database...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No voucher products found. Add your first one above!</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {products.map((item) => (
              <div key={item.id} className={`grid grid-cols-12 gap-4 p-4 items-center transition group ${editingId === item.id ? 'bg-red-900/10' : 'hover:bg-white/5'}`}>
                
                <div className="col-span-4 font-bold text-white">
                  {item.name}
                  <span className="block text-[10px] text-gray-500 font-mono uppercase">{item.type}</span>
                </div>
                
                <div className="col-span-2">
                  {editingId === item.id ? (
                    <input 
                      type="number" 
                      step="0.01"
                      value={tempData.cost}
                      onChange={(e) => setTempData({...tempData, cost: parseFloat(e.target.value)})}
                      className="w-24 bg-black border border-red-500 rounded-lg py-2 px-2 text-white text-sm outline-none font-mono"
                    />
                  ) : (
                    <span className="text-gray-400 font-mono">₵{item.cost.toFixed(2)}</span>
                  )}
                </div>
                
                <div className="col-span-2">
                  {editingId === item.id ? (
                    <input 
                      type="number" 
                      step="0.01"
                      value={tempData.price}
                      onChange={(e) => setTempData({...tempData, price: parseFloat(e.target.value)})}
                      className="w-24 bg-black border border-red-500 rounded-lg py-2 px-2 text-white text-sm outline-none font-mono font-bold"
                    />
                  ) : (
                    <span className="bg-gray-800 border border-gray-600 px-3 py-1 rounded-lg text-white font-bold font-mono text-sm">
                      ₵{item.price.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <div className="col-span-2">
                  {editingId === item.id ? (
                    <span className={`font-bold text-sm ${(tempData.price - tempData.cost) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                      +₵{(tempData.price - tempData.cost).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-green-400 font-bold text-sm">
                      +₵{(item.price - item.cost).toFixed(2)}
                    </span>
                  )}
                </div>
                
                <div className="col-span-2 text-right">
                  {editingId === item.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={saveEdit} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition text-xs font-bold">
                        💾 Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition text-xs">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => startEdit(item)}
                      className="text-gray-400 hover:text-white transition font-bold text-xs uppercase bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700"
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}

function StatBox({ label, value, icon, color = "text-white" }: any) {
  return (
    <div className="bg-[#111] border border-gray-800 p-4 rounded-xl flex items-center justify-between">
      <div>
        <p className="text-[10px] text-gray-500 font-bold uppercase">{label}</p>
        <h4 className={`text-xl font-bold ${color}`}>{value}</h4>
      </div>
      <span className="text-2xl grayscale opacity-50">{icon}</span>
    </div>
  );
}
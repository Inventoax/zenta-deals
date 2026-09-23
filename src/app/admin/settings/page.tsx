"use client";
import React, { useState } from 'react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  
  // MOCK STATE (These would come from DB)
  const [config, setConfig] = useState({
    siteName: "Zenta Deals Enterprise",
    supportPhone: "233556631260", // Used for WhatsApp Link
    maintenanceMode: false,
    allowSignups: true,
  });

  const handleSave = () => {
    setLoading(true);
    // Simulate API Save
    setTimeout(() => {
      setLoading(false);
      alert("System Settings Updated Successfully! 🚀");
    }, 1500);
  };

  return (
    <div className="p-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-gray-400 mt-1">Global configuration and security controls.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg shadow-red-900/20 flex items-center gap-2"
        >
          {loading ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- SECTION 1: GENERAL CONFIG --- */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 animate-fade-in-up">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🛠️</span> General Configuration
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Platform Name</label>
              <input 
                type="text" 
                value={config.siteName}
                onChange={(e) => setConfig({...config, siteName: e.target.value})}
                className="w-full bg-black border border-gray-700 rounded-xl py-3 px-4 text-white outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Support WhatsApp Number</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-green-500">📞</span>
                <input 
                  type="text" 
                  value={config.supportPhone}
                  onChange={(e) => setConfig({...config, supportPhone: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-green-500 transition font-mono"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">This updates the "Join WhatsApp" link across the entire platform.</p>
            </div>
          </div>
        </div>


        {/* --- SECTION 2: SYSTEM CONTROLS --- */}
        <div className="bg-[#1a0505] border border-red-900/30 rounded-2xl p-8 animate-fade-in-up">
          <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
            <span>⚡</span> Danger Zone
          </h3>

          <div className="space-y-6">
            
            {/* Maintenance Toggle */}
            <div className="flex items-center justify-between p-4 bg-black/50 border border-red-900/20 rounded-xl">
              <div>
                <h4 className="font-bold text-white">Maintenance Mode</h4>
                <p className="text-xs text-gray-500">Lock the site for all users except admins.</p>
              </div>
              <Toggle 
                active={config.maintenanceMode} 
                onToggle={() => setConfig({...config, maintenanceMode: !config.maintenanceMode})} 
              />
            </div>

            {/* Signup Toggle */}
            <div className="flex items-center justify-between p-4 bg-black/50 border border-red-900/20 rounded-xl">
              <div>
                <h4 className="font-bold text-white">Allow New Registrations</h4>
                <p className="text-xs text-gray-500">If disabled, no new agents can sign up.</p>
              </div>
              <Toggle 
                active={config.allowSignups} 
                onToggle={() => setConfig({...config, allowSignups: !config.allowSignups})} 
              />
            </div>

          </div>
        </div>


        {/* --- SECTION 3: ADMIN SECURITY --- */}
        <div className="lg:col-span-2 bg-[#111] border border-gray-800 rounded-2xl p-8 animate-fade-in-up">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🔒</span> Admin Security
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-black border border-gray-700 rounded-xl py-3 px-4 text-white outline-none focus:border-red-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-black border border-gray-700 rounded-xl py-3 px-4 text-white outline-none focus:border-red-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-black border border-gray-700 rounded-xl py-3 px-4 text-white outline-none focus:border-red-500 transition" />
            </div>
          </div>
          
          <div className="mt-6 text-right">
             <button className="text-sm text-red-400 hover:text-white font-bold underline">Force Logout All Admin Sessions</button>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Toggle({ active, onToggle }: any) {
  return (
    <div 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${active ? 'bg-red-500' : 'bg-gray-700'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md transition-all duration-300 ${active ? 'left-[26px]' : 'left-[2px]'}`}></div>
    </div>
  );
}
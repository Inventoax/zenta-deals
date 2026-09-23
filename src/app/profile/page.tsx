"use client";
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';

export default function ProfilePage() {
  // 1. CLEAN STATE (Default / Empty)
  const [user, setUser] = useState({
    name: "Agent Account", // Default name
    email: "agent@zentadeals.com", // From login
    phone: "",
    address: "",
    role: "Standard Agent",
    memberSince: "August 2026",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setTempImage(imageUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto h-screen relative bg-[#0b1121]">
        
        {/* HEADER */}
        <header className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0f172a] sticky top-0 z-20">
          <h1 className="text-xl font-bold tracking-tight">Profile Settings</h1>
        </header>

        <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">

          {/* --- SECTION A: PROFILE CARD --- */}
          <div className="bg-[#1e293b]/50 border border-gray-700/50 rounded-2xl p-8 flex flex-col items-center text-center relative backdrop-blur-sm">
            
            {/* Avatar Placeholder */}
            <div className="relative group cursor-pointer">
              <div className="h-28 w-28 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-4xl font-bold text-gray-500 overflow-hidden shadow-2xl">
                {tempImage ? (
                  <img src={tempImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  "👤" // Generic Icon
                )}
              </div>
              
              <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer">
                <span className="text-xs font-bold text-white">Upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{user.email}</p>

            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="mt-6 w-full max-w-xs border border-gray-600 hover:border-white hover:bg-gray-800 text-white py-2 rounded-lg transition text-sm font-medium flex items-center justify-center gap-2"
            >
              📝 {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>


          {/* --- SECTION B: PERSONAL INFORMATION --- */}
          <div className="bg-[#1e293b]/50 border border-gray-700/50 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-1">Personal Information</h3>
            <p className="text-gray-400 text-sm mb-6">Complete your profile to verify your account.</p>

            <div className="space-y-6">
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={user.name === "Agent Account" ? "" : user.name} // Show empty if default
                  placeholder="Enter your full name"
                  disabled={!isEditing}
                  onChange={(e) => setUser({...user, name: e.target.value})}
                  className={`w-full bg-[#0f172a] border ${isEditing ? 'border-blue-500/50' : 'border-gray-700'} rounded-xl py-3 px-4 text-white outline-none focus:border-blue-500 transition`}
                />
              </div>

              {/* Phone (Empty by default) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={user.phone}
                  placeholder="05X XXX XXXX"
                  disabled={!isEditing}
                  onChange={(e) => setUser({...user, phone: e.target.value})}
                  className={`w-full bg-[#0f172a] border ${isEditing ? 'border-blue-500/50' : 'border-gray-700'} rounded-xl py-3 px-4 text-white outline-none focus:border-blue-500 transition`}
                />
              </div>

              {/* Address (Empty by default) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Address / Location</label>
                <input 
                  type="text" 
                  value={user.address}
                  placeholder="City, Region"
                  disabled={!isEditing}
                  onChange={(e) => setUser({...user, address: e.target.value})}
                  className={`w-full bg-[#0f172a] border ${isEditing ? 'border-blue-500/50' : 'border-gray-700'} rounded-xl py-3 px-4 text-white outline-none focus:border-blue-500 transition`}
                />
              </div>

              {/* Read-Only Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={user.email}
                  disabled 
                  className="w-full bg-[#0f172a]/50 border border-gray-800 rounded-xl py-3 px-4 text-gray-500 cursor-not-allowed outline-none"
                />
                <p className="text-xs text-gray-600 mt-2">Email is linked to your account ID.</p>
              </div>

            </div>
          </div>


          {/* --- SECTION C: SECURITY --- */}
          <div className="bg-[#1e293b]/50 border border-gray-700/50 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Security</h3>
            <button className="w-full flex items-center justify-between p-4 bg-[#0f172a] border border-gray-700 rounded-xl hover:border-gray-500 transition">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center">🔒</div>
                <div className="text-left">
                  <h4 className="font-bold text-sm">Change Password</h4>
                  <p className="text-xs text-gray-500">Secure your account</p>
                </div>
              </div>
              <span className="text-blue-400 text-sm font-bold">Update</span>
            </button>
          </div>

          {/* SAVE BUTTON */}
          {isEditing && (
            <div className="sticky bottom-6 animate-fade-in-up">
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold shadow-xl transition transform hover:-translate-y-1">
                Save Changes
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
"use client";
import React, { useState, useEffect } from 'react';

export default function WhatsAppPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup 3 seconds after page loads
    const timer = setTimeout(() => {
      const hasJoined = localStorage.getItem("whatsapp_joined");
      if (!hasJoined) {
        setIsVisible(true);
      }
    }, 30000000);
    return () => clearTimeout(timer);
  }, []);

  const handleJoin = () => {
    // Mark as joined so it doesn't show again immediately
    localStorage.setItem("whatsapp_joined", "true");
    window.open("https://chat.whatsapp.com/BymCPk0L1r37IDKuNYepM4?mode=wwt", "_blank");
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      {/* Dark Overlay with Blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={handleDismiss}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-[#0f172a] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-700 transform transition-all scale-100">
        
        {/* --- HEADER (Green Gradient) --- */}
        <div className="bg-gradient-to-br from-[#25D366] to-[#128c7e] p-8 text-center relative">
          <button 
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center transition"
          >
            ✕
          </button>
          
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-4xl">
            💬
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">Join Our WhatsApp Community!</h2>
          <p className="text-white/90 text-sm mt-2 font-medium">Stay connected and get exclusive updates.</p>
        </div>

        {/* --- BODY (Benefits List) --- */}
        <div className="p-6 space-y-6">
          
          {/* Benefit 1 */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center shrink-0 text-lg border border-green-500/20">
              🔔
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Instant Notifications</h3>
              <p className="text-gray-400 text-xs mt-0.5">Get real-time updates on offers and promotions.</p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 text-lg border border-blue-500/20">
              👥
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Exclusive Community</h3>
              <p className="text-gray-400 text-xs mt-0.5">Connect with admins and get priority support.</p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 text-lg border border-purple-500/20">
              🎧
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Direct Communication</h3>
              <p className="text-gray-400 text-xs mt-0.5">Easy access to customer support and quick responses.</p>
            </div>
          </div>

        </div>

        {/* --- FOOTER (Buttons) --- */}
        <div className="p-6 pt-0 space-y-3">
          <button 
            onClick={handleJoin}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold py-3.5 rounded-xl shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <span className="text-xl">💬</span> Join WhatsApp Community
          </button>
          
          <button 
            onClick={handleDismiss}
            className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition"
          >
            Remind Me Later
          </button>
          
          <p className="text-center text-[10px] text-gray-500 mt-4">
            You can always find the link on our website sidebar.
          </p>
        </div>

      </div>
    </div>
  );
}
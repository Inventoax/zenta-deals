"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please log in.');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to log in');
      }

      // Store user info in localStorage or state management if needed, then redirect
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard or home page
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl animate-fade-in-up">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
        <p className="text-xs text-gray-400 mt-1">Log in to manage your wallet and purchase data bundles.</p>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 p-3.5 rounded-xl text-xs font-medium">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
          <input 
            type="email"
            name="email"
            required
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-red-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
          <input 
            type="password"
            name="password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-red-500 transition"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-900/20 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-red-400 font-bold hover:underline">
          Sign up
        </Link>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-gray-500 text-xs">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
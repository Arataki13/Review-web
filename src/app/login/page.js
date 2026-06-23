'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Film, Gamepad2, Mail, Lock, LogIn, Key, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle standard email/password login or signup
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || (!isOtpMode && !password)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        // Sign Up with Email and Password
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signupError) throw signupError;
        
        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists.');
        } else {
          setMessage('Signup successful! Check your email for a confirmation link.');
        }
      } else {
        // Sign In with Email and Password
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;
      }
    } catch (err) {
      console.error('Email Auth Error:', err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle requesting a One-Time Password (OTP)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Will sign up the user if they do not exist
          emailRedirectTo: window.location.origin,
        }
      });

      if (otpError) throw otpError;
      setOtpSent(true);
      setMessage('OTP verification code has been sent to your email.');
    } catch (err) {
      console.error('OTP Request Error:', err);
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle verifying the OTP token entered by the user
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!email || !otpCode) {
      setError('Please enter the OTP code.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (verifyError) throw verifyError;
    } catch (err) {
      console.error('OTP Verification Error:', err);
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth provider redirects (Google/Apple)
  const handleOAuthLogin = async (provider) => {
    setError('');
    setMessage('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      console.error(`${provider} Login Error:`, err);
      setError(err.message || `Failed to initialize login with ${provider}.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden select-none">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Left Side: Branding/Intro (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-zinc-900/40 border-r border-zinc-800/60 relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-xl shadow-indigo-600/30">
              M
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-zinc-100 text-lg leading-tight">My Tracker</h1>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">Media Log</span>
            </div>
          </div>

          <div className="space-y-6 my-auto py-12">
            <h2 className="text-3xl font-black text-zinc-100 leading-tight">
              Manage your entertainment backlog in style.
            </h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Track finished movies, log currently playing games, monitor wishlists, and capture personal reviews. Sync everything to your personal catalog securely.
            </p>
            
            <div className="flex items-center space-x-4 pt-4 text-zinc-500">
              <div className="flex items-center space-x-1">
                <Film className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold">Movies</span>
              </div>
              <span className="text-zinc-800">•</span>
              <div className="flex items-center space-x-1">
                <Gamepad2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold">Games</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-600 font-medium">
            © {new Date().getFullYear()} My Tracker. All rights reserved.
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-zinc-150 tracking-tight">
              {isSignUp ? 'Create an Account' : otpSent ? 'Verify OTP Code' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-zinc-450 mt-1.5 leading-relaxed">
              {isSignUp 
                ? 'Sign up with your personal email to get started.' 
                : otpSent 
                  ? `Enter the 6-digit code sent to ${email}.`
                  : isOtpMode
                    ? 'Sign in passwordlessly with a verification code.'
                    : 'Sign in with your email and password.'
              }
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs p-3.5 rounded-xl font-medium flex items-start">
              <span className="flex-1 leading-normal">{error}</span>
            </div>
          )}
          
          {message && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-455 text-xs p-3.5 rounded-xl font-medium flex items-start">
              <span className="flex-1 leading-normal">{message}</span>
            </div>
          )}

          {/* Verification Code Form */}
          {otpSent ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Verification Code (OTP)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-center text-lg font-black tracking-widest text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg shadow-indigo-600/10 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                Confirm Verification
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest mt-2 block"
              >
                Go Back
              </button>
            </form>
          ) : (
            <form onSubmit={isOtpMode ? handleRequestOtp : handleEmailAuth} className="space-y-4">
              
              {/* Email field */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                </div>
              </div>

              {/* Password field (hidden in OTP mode) */}
              {!isOtpMode && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg shadow-indigo-600/10 transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                {isSignUp ? 'Sign Up' : isOtpMode ? 'Send Verification OTP' : 'Sign In'}
              </button>

              {/* Auth Mode Toggles */}
              <div className="flex flex-col gap-2 pt-2 text-center text-xs">
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpMode(!isOtpMode);
                      setError('');
                      setMessage('');
                    }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-350 uppercase tracking-widest"
                  >
                    {isOtpMode ? 'Use Password Sign In' : 'Sign In with Email OTP Code'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setIsOtpMode(false);
                    setError('');
                    setMessage('');
                  }}
                  className="text-zinc-500 font-medium hover:text-zinc-300 mt-1"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>

              {/* Social Login Separator */}
              <div className="relative my-6 flex items-center">
                <div className="flex-grow border-t border-zinc-850"></div>
                <span className="flex-shrink mx-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Or login with</span>
                <div className="flex-grow border-t border-zinc-850"></div>
              </div>

              {/* Social Login buttons */}
              <div className="grid grid-cols-2 gap-4">
                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  className="flex items-center justify-center bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-300 hover:text-zinc-100 transition active:scale-95"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>

                {/* Apple Sign In */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('apple')}
                  className="flex items-center justify-center bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-300 hover:text-zinc-100 transition active:scale-95"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.09.09 2.21-.54 2.94-1.39z" />
                  </svg>
                  Apple
                </button>
              </div>
              
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

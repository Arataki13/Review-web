'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CreditCard, Calendar, ShieldCheck, AlertTriangle, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export default function PayzySimulatorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setError('Missing Order ID parameter.');
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (supabaseError) throw supabaseError;
      if (!data) throw new Error('Order not found.');
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Could not retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async (status) => {
    if (!order) return;
    setProcessing(true);
    setError('');

    try {
      if (status === 'paid') {
        // Send a simulated server-to-server webhook request to our callback endpoint
        const webhookRes = await fetch('/api/webhooks/payzy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: order.id,
            status: 'paid',
            transaction_id: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            amount: order.amount,
            signature: 'simulated_valid_signature_hash',
          }),
        });

        if (!webhookRes.ok) {
          const webhookErr = await webhookRes.json();
          throw new Error(webhookErr.error || 'Failed to process payment status in webhook callback.');
        }

        // Wait a brief second to give a realistic loading experience, then redirect
        setTimeout(() => {
          router.push(`/checkout/success?order_id=${order.id}`);
        }, 1200);
      } else {
        // Simulate cancelled/failed payment
        await fetch('/api/webhooks/payzy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: order.id,
            status: 'failed',
            signature: 'simulated_valid_signature_hash',
          }),
        });

        setTimeout(() => {
          router.push(`/checkout/cancel?order_id=${order.id}`);
        }, 800);
      }
    } catch (err) {
      console.error('Simulated payment error:', err);
      setError(err.message || 'An error occurred during simulation.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wider uppercase text-zinc-400">Loading Secure Payzy Portal...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-850 p-8 rounded-3xl text-center space-y-6">
          <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
          <h2 className="text-2xl font-black text-zinc-150 tracking-tight">Gateway Connection Error</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">{error || 'Unable to connect to Payzy Secure Checkout.'}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs uppercase tracking-widest transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const installmentAmount = Math.round(order.amount / 3);
  const today = new Date();
  const formatFutureDate = (monthsAhead) => {
    const d = new Date(today);
    d.setMonth(today.getMonth() + monthsAhead);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between py-10 px-4">
      {/* Header bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
            payzy.lk
          </span>
          <span className="text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Staging Sandbox
          </span>
        </div>
        <div className="flex items-center text-[10px] text-zinc-400 font-medium space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure 256-bit Connection</span>
        </div>
      </div>

      {/* Main card */}
      <div className="max-w-2xl w-full mx-auto bg-zinc-900 border border-zinc-850 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500"></div>

        <div className="space-y-8">
          {/* Order Brief */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-850">
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Merchant Store</p>
              <h3 className="text-lg font-bold text-zinc-200">Arataki Game Store</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Order ID: <code className="text-indigo-400">{order.id}</code></p>
            </div>
            <div className="text-left sm:text-right bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Total Order Amount</p>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-300">
                LKR {order.amount.toLocaleString()}.00
              </p>
            </div>
          </div>

          {/* Product card info */}
          <div className="flex items-center gap-4 bg-zinc-950/60 p-4 border border-zinc-850/60 rounded-2xl">
            {order.game_poster && (
              <img
                src={order.game_poster}
                alt={order.game_title}
                className="w-14 h-16 object-cover rounded-lg border border-zinc-800"
              />
            )}
            <div>
              <span className="text-[9px] uppercase font-extrabold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded">
                E-Commerce Order
              </span>
              <h4 className="text-sm font-bold text-zinc-200 mt-1">{order.game_title}</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Payzy BNPL Plan: 3 Equal Instalments</p>
            </div>
          </div>

          {/* Installment plan representation */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-cyan-400" />
              Your 3-Month Interest-Free Installment Plan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Instalment 1 */}
              <div className="bg-gradient-to-b from-zinc-950 to-zinc-950/80 p-4 rounded-2xl border border-zinc-850 relative">
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Instalment 01</p>
                <p className="text-lg font-black text-zinc-200 mt-1.5">LKR {installmentAmount.toLocaleString()}</p>
                <p className="text-[10px] text-cyan-455 font-semibold mt-1.5 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-cyan-400 fill-cyan-400/10" /> Today
                </p>
              </div>

              {/* Instalment 2 */}
              <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-850/60">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Instalment 02</p>
                <p className="text-lg font-black text-zinc-300 mt-1.5">LKR {installmentAmount.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-400 font-semibold mt-1.5">
                  Due {formatFutureDate(1)}
                </p>
              </div>

              {/* Instalment 3 */}
              <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-850/60">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Instalment 03</p>
                <p className="text-lg font-black text-zinc-300 mt-1.5">LKR {installmentAmount.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-400 font-semibold mt-1.5">
                  Due {formatFutureDate(2)}
                </p>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed bg-zinc-950/30 p-3 rounded-xl border border-zinc-900">
              * By clicking "Approve & Pay" below, the first installment of LKR {installmentAmount.toLocaleString()} will be charged immediately to your credit/debit card. The remaining two installments will be automatically debited monthly with zero interest or additional fees.
            </p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="pt-8 mt-8 border-t border-zinc-850 space-y-4">
          {processing ? (
            <div className="flex flex-col items-center justify-center p-3 space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Processing Transaction Secures...</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Approve & Pay button */}
              <button
                onClick={() => handleSimulatePayment('paid')}
                disabled={processing}
                className="flex-1 flex items-center justify-center bg-gradient-to-r from-cyan-500 to-indigo-650 hover:from-cyan-400 hover:to-indigo-550 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-cyan-500/15 active:scale-[0.98] transition duration-200"
              >
                Approve & Pay
                <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />
              </button>

              {/* Cancel transaction */}
              <button
                onClick={() => handleSimulatePayment('failed')}
                disabled={processing}
                className="w-full sm:w-auto px-6 py-4 bg-zinc-950 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 border border-zinc-850 hover:border-rose-500/20 font-bold text-xs uppercase tracking-wider rounded-xl transition duration-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-md w-full mx-auto text-center mt-8 space-y-2">
        <div className="flex justify-center items-center space-x-2 text-zinc-600 text-[10px]">
          <ShieldCheck className="w-4 h-4 text-zinc-500" />
          <span>Payzy Sri Lanka. Authorized Payment Provider.</span>
        </div>
        <p className="text-[9px] text-zinc-650 leading-relaxed">
          This is a simulated sandbox staging portal. No real money will be charged. All transactions are logged strictly for checkout flow verification.
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, ChevronRight, ShoppingBag, ShieldCheck, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('verifying'); // 'verifying', 'confirmed', 'failed', 'timeout'
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      return;
    }

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setOrder(data);
          if (data.status === 'paid') {
            setStatus('confirmed');
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setStatus('failed');
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Error polling order status:', err);
      }

      setAttempts((prev) => {
        if (prev >= 15) { // Stop after 15 attempts (~22 seconds)
          clearInterval(interval);
          setStatus('timeout');
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-850 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>

        {status === 'verifying' && (
          <div className="py-8 space-y-6">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-zinc-150 tracking-tight">Confirming Payment...</h2>
              <p className="text-zinc-400 text-xs max-w-xs mx-auto leading-relaxed">
                We are waiting for Payzy to confirm your interest-free installment checkout. This should only take a few moments.
              </p>
            </div>
          </div>
        )}

        {status === 'confirmed' && (
          <div className="space-y-6">
            {/* Success icon */}
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Payment Confirmed!</h2>
              <p className="text-zinc-400 text-xs">
                Your purchase was completed successfully via **Payzy Buy Now, Pay Later**.
              </p>
            </div>

            {/* Receipt Card */}
            {order && (
              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 text-left space-y-4 shadow-inner">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Transaction Status</span>
                  <span className="text-[9px] uppercase font-black bg-emerald-500/15 text-emerald-450 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    Completed (LKR)
                  </span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-light">Game Title:</span>
                    <span className="text-zinc-200 font-bold text-right truncate max-w-[200px]">
                      {order.game_title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-light">Order ID:</span>
                    <span className="font-mono text-indigo-400 font-medium">
                      {order.id.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-light">Charged Today:</span>
                    <span className="text-zinc-200 font-bold">
                      LKR {Math.round(order.amount / 3).toLocaleString()}.00
                    </span>
                  </div>
                  <div className="flex justify-between pt-2.5 border-t border-zinc-900">
                    <span className="text-zinc-300 font-semibold">Total Cost:</span>
                    <span className="text-zinc-100 font-black text-sm">
                      LKR {order.amount.toLocaleString()}.00
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href={`/games/${order?.game_id}`}
                className="flex-1 flex items-center justify-center bg-indigo-600 hover:bg-indigo-505 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition duration-200"
              >
                View Game Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                href="/games"
                className="flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-zinc-450 hover:text-zinc-200 border border-zinc-850 py-3.5 px-4 rounded-xl transition duration-200"
              >
                <ShoppingBag className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {(status === 'failed' || status === 'timeout') && (
          <div className="py-6 space-y-6">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <span className="text-3xl">⚠️</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-zinc-100 tracking-tight">
                {status === 'timeout' ? 'Verification Timeout' : 'Order Verification Failed'}
              </h2>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-xs mx-auto">
                {status === 'timeout'
                  ? 'We could not confirm your payment status in a timely manner. Please check if your bank account was debited before trying again.'
                  : 'The payment process failed, was rejected by the provider, or the order identifier is invalid.'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-4">
              <Link
                href="/games"
                className="w-full flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl border border-zinc-850 transition duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
              </Link>
            </div>
          </div>
        )}

        <div className="flex justify-center items-center space-x-1.5 text-zinc-600 text-[10px] pt-4 border-t border-zinc-900/60">
          <ShieldCheck className="w-4 h-4 text-zinc-550" />
          <span>Payzy Installment Purchase Protected</span>
        </div>
      </div>
    </div>
  );
}

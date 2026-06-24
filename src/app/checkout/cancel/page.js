'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-850 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500"></div>

        {/* Warning Icon */}
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertCircle className="w-10 h-10 text-rose-500 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Payment Cancelled</h2>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-xs mx-auto">
            Your transaction with **Payzy Buy Now, Pay Later** was aborted. No funds have been debited from your card.
          </p>
        </div>

        {/* Actions panel */}
        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/games"
            className="w-full flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl border border-zinc-850 transition duration-200"
          >
            <ShoppingBag className="w-4.5 h-4.5 mr-2 text-zinc-500" />
            Browse Other Games
          </Link>
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-505 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Checkout
          </button>
        </div>

        <p className="text-[10px] text-zinc-600 pt-4 border-t border-zinc-900/60 leading-relaxed">
          Need help? If you experienced a gateway error or connection timeout, please check your network connection and try again.
        </p>
      </div>
    </div>
  );
}

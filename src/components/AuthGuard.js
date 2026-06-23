'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial check
    checkSession();

    // 2. Setup subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleRedirect(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      handleRedirect(session);
    } catch (e) {
      console.error('Error checking auth session:', e);
      setLoading(false);
    }
  };

  const handleRedirect = (currentSession) => {
    const isAuthPage = pathname === '/login';

    if (!currentSession) {
      if (!isAuthPage) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    } else {
      if (isAuthPage) {
        router.push('/');
      } else {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-sm text-zinc-400 font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

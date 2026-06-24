import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { user, email_data } = body;

    const email = user?.email;
    const otp = email_data?.token;

    if (!email || !otp) {
      console.warn('Send Email Hook: Missing email or token in payload', body);
      return NextResponse.json({ error: 'Missing email or token' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // Initialize client with service key to bypass RLS and write to test_otps
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert into test_otps table
    const { error } = await supabaseAdmin
      .from('test_otps')
      .upsert({ 
        email, 
        otp, 
        created_at: new Date().toISOString() 
      }, { onConflict: 'email' });

    if (error) {
      console.error('Failed to save OTP to database via hook:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[SANDBOX AUTH HOOK] Successfully intercepted OTP for ${email}: ${otp}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Send Email Hook exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { order_id, status, transaction_id, signature } = body;

    if (!order_id || !status) {
      return NextResponse.json({ error: 'Missing required webhook fields: order_id or status' }, { status: 400 });
    }

    // Retrieve database keys from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.warn(
        'Warning: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables. ' +
        'Updating orders table from the webhook may fail due to database Row Level Security (RLS).'
      );
    }

    // Initialize Supabase client with the service role key to bypass RLS.
    // If the service key is not configured, fall back to anon key (which may fail if RLS is enabled).
    const supabaseAdmin = createClient(
      supabaseUrl, 
      supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    // Signature Verification (Production Layout):
    // In production, Payzy will sign the webhook payload. You would verify it like this:
    // const crypto = require('crypto');
    // const hash = crypto.createHmac('sha256', process.env.PAYZY_WEBHOOK_SECRET)
    //                    .update(order_id + status)
    //                    .digest('hex');
    // if (signature !== hash) {
    //   return NextResponse.json({ error: 'Invalid webhook signature verification' }, { status: 403 });
    // }

    const dbStatus = status === 'paid' ? 'paid' : 'failed';

    // Update order status in the Supabase 'orders' table
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: dbStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .select()
      .single();

    if (updateError) {
      console.error(`Supabase error updating order ID ${order_id} via webhook:`, updateError);
      return NextResponse.json({ error: 'Failed to update order status in database: ' + updateError.message }, { status: 500 });
    }

    console.log(`Payzy Webhook: Order ${order_id} status successfully set to: ${dbStatus}`);

    return NextResponse.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Payzy Webhook Handler Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

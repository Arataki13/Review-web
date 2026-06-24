import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a Supabase client scoped to the user's JWT from the authorization header
function getSupabaseUserClient(request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (token) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function POST(request) {
  try {
    const supabaseUser = getSupabaseUserClient(request);
    
    // 1. Verify user authentication
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { gameId, gameTitle, gamePoster, amount } = body;

    if (!gameId || !gameTitle || !amount) {
      return NextResponse.json({ error: 'Missing required parameters: gameId, gameTitle, or amount' }, { status: 400 });
    }

    // 3. Create a pending order in Supabase
    const { data: order, error: orderError } = await supabaseUser
      .from('orders')
      .insert([
        {
          user_id: user.id,
          game_id: String(gameId),
          game_title: gameTitle,
          game_poster: gamePoster || null,
          amount: Number(amount),
          currency: 'LKR',
          status: 'pending',
        }
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create pending order in Supabase:', orderError);
      return NextResponse.json({ error: 'Database transaction failed: ' + orderError.message }, { status: 500 });
    }

    // 4. Determine checkout redirect URL
    // If the merchant credentials are configured in environment variables, we would hit the real Payzy API.
    // Otherwise, we fallback to our Payzy simulator portal to allow seamless end-to-end sandbox testing.
    let redirectUrl = `/checkout/payzy-simulator?order_id=${order.id}`;

    if (process.env.PAYZY_API_KEY && process.env.PAYZY_API_KEY !== 'your_payzy_api_key') {
      try {
        // Real Payzy API call execution:
        const payzyRes = await fetch('https://api.payzy.lk/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PAYZY_API_KEY}`
          },
          body: JSON.stringify({
            merchant_id: process.env.PAYZY_MERCHANT_ID,
            order_id: order.id,
            amount: order.amount,
            currency: 'LKR',
            return_url: `${new URL(request.url).origin}/checkout/success?order_id=${order.id}`,
            cancel_url: `${new URL(request.url).origin}/checkout/cancel?order_id=${order.id}`,
            webhook_url: `${new URL(request.url).origin}/api/webhooks/payzy`
          })
        });
        const payzyData = await payzyRes.json();
        if (payzyData.checkout_url) {
          redirectUrl = payzyData.checkout_url;
        } else {
          console.warn('Payzy API did not return checkout_url, API response:', payzyData);
        }
      } catch (payzyErr) {
        console.error('Error invoking real Payzy API, falling back to simulator:', payzyErr);
      }
    }

    return NextResponse.json({ success: true, redirectUrl, orderId: order.id });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

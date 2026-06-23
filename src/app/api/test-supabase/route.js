import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('entries')
      .insert([
        {
          title: 'Vercel Diagnostic Test',
          category: 'game',
          status: 'wishlist',
          rating: null,
          note: null,
          poster_url: null,
          description: null,
          external_id: null,
          external_rating: null,
        }
      ])
      .select();

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Supabase returned an error during insert.',
        error: error
      });
    }

    // Clean up if succeeded
    if (data && data[0]) {
      await supabase.from('entries').delete().eq('id', data[0].id);
    }

    return NextResponse.json({
      success: true,
      message: 'Your Supabase database connection and columns are 100% correct!'
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: 'An exception occurred on Vercel.',
      error: err.message
    });
  }
}

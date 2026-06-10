import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term') || '';

  if (!term) {
    return NextResponse.json({ items: [] });
  }

  try {
    const response = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&cc=us&l=en`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Steam search returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Steam search proxy error:', error);
    return NextResponse.json({ error: error.message, items: [] }, { status: 500 });
  }
}

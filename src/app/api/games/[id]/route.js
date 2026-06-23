import { NextResponse } from 'next/server';
import { withCache } from '@/lib/cache';

export async function GET(request, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Missing game ID' }, { status: 400 });
  }

  const cacheKey = `game_details_${id}`;

  try {
    const data = await withCache(cacheKey, async () => {
      const url = `https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=en`;
      
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Steam appdetails returned status ${res.status}`);
      }

      const raw = await res.json();

      if (!raw[id] || !raw[id].success) {
        throw new Error('Game not found or Steam request unsuccessful');
      }

      const rawData = raw[id].data;

      // Pricing logic
      let price = 'TBD';
      if (rawData.is_free) {
        price = 'Free';
      } else if (rawData.price_overview) {
        price = rawData.price_overview.final_formatted || rawData.price_overview.initial_formatted || 'Paid';
      }

      // Platforms mapping
      const platforms = [];
      if (rawData.platforms) {
        if (rawData.platforms.windows) platforms.push('Windows');
        if (rawData.platforms.mac) platforms.push('macOS');
        if (rawData.platforms.linux) platforms.push('Linux');
      }

      // Format description: remove HTML tags
      const cleanDescription = (html) => {
        if (!html) return '';
        return html
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&quot;/g, '"')
          .trim();
      };

      return {
        id: Number(id),
        title: rawData.name || '',
        short_description: rawData.short_description || '',
        long_description: cleanDescription(rawData.detailed_description) || '',
        release_date: rawData.release_date?.date || 'TBD',
        price,
        genres: (rawData.genres || []).map((g) => g.description),
        platforms,
        header_url: rawData.header_image || null,
        capsule_url: rawData.capsule_image || null,
        screenshots: (rawData.screenshots || []).map((s) => s.path_full),
        metacritic_score: rawData.metacritic?.score || null,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Game details proxy error for ID ${id}:`, error);
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

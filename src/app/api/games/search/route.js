import { NextResponse } from 'next/server';
import { withCache } from '@/lib/cache';

const POPULAR_GAME_IDS = [
  1245625, // Elden Ring
  730,     // Counter-Strike 2
  1091500, // Cyberpunk 2077
  413150,  // Stardew Valley
  620,     // Portal 2
  271590,  // GTA V
  292030,  // The Witcher 3: Wild Hunt
  105600,  // Terraria
  1174180, // Red Dead Redemption 2
  1086940, // Baldur's Gate 3
  367520,  // Hollow Knight
  1145360, // Hades
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const year = searchParams.get('year') || '';
  const rating = searchParams.get('rating') || '';

  const cacheKey = `games_search_${q}_${genre}_${year}_${rating}`;

  try {
    const data = await withCache(cacheKey, async () => {
      let rawResults = [];

      if (q) {
        // Query Steam search
        const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&cc=us&l=en`;
        const res = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
          },
        });
        if (res.ok) {
          const raw = await res.json();
          rawResults = (raw.items || []).map((item) => ({ id: item.id }));
        }
      } else {
        // Try getting featured games
        try {
          const featuredUrl = 'https://store.steampowered.com/api/featured';
          const res = await fetch(featuredUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json',
            },
          });
          if (res.ok) {
            const raw = await res.json();
            const featuredList = [
              ...(raw.large_capsules || []),
              ...(raw.featured_win || []),
              ...(raw.featured_mac || []),
              ...(raw.featured_linux || []),
            ];
            // Extract unique IDs
            const uniqueIds = Array.from(new Set(featuredList.map((item) => item.id)));
            rawResults = uniqueIds.map((id) => ({ id }));
          }
        } catch (featuredError) {
          console.warn('Failed to fetch featured Steam categories, falling back to popular IDs:', featuredError);
        }

        // Fallback to static popular list if featured list is empty
        if (rawResults.length === 0) {
          rawResults = POPULAR_GAME_IDS.map((id) => ({ id }));
        }
      }

      // Limit concurrent details fetching (max 15 items to speed up response and avoid rate limits)
      const itemsToResolve = rawResults.slice(0, 15);

      const resolved = await Promise.all(
        itemsToResolve.map(async (item) => {
          const appId = item.id;
          const detailCacheKey = `game_details_${appId}`;

          try {
            return await withCache(detailCacheKey, async () => {
              const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`;
              const res = await fetch(url, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'application/json',
                },
              });
              if (!res.ok) return null;
              const raw = await res.json();
              if (!raw[appId] || !raw[appId].success) return null;

              const data = raw[appId].data;

              // Format price
              let price = 'TBD';
              if (data.is_free) {
                price = 'Free';
              } else if (data.price_overview) {
                price = data.price_overview.final_formatted || data.price_overview.initial_formatted || 'Paid';
              }

              // Platforms
              const platforms = [];
              if (data.platforms) {
                if (data.platforms.windows) platforms.push('Windows');
                if (data.platforms.mac) platforms.push('macOS');
                if (data.platforms.linux) platforms.push('Linux');
              }

              return {
                id: Number(appId),
                title: data.name || '',
                header_url: data.header_image || null,
                capsule_url: data.capsule_image || null,
                release_date: data.release_date?.date || 'TBD',
                price,
                genres: (data.genres || []).map((g) => g.description),
                platforms,
                metacritic_score: data.metacritic?.score || null,
              };
            });
          } catch (e) {
            console.error(`Failed to fetch details for game ${appId} during search:`, e);
            return null;
          }
        })
      );

      // Clean up resolved list
      let filtered = resolved.filter(Boolean);

      // Apply filters in-memory
      if (genre) {
        const lowerGenre = genre.toLowerCase();
        filtered = filtered.filter((game) =>
          game.genres.some((g) => g.toLowerCase() === lowerGenre)
        );
      }
      
      if (year) {
        filtered = filtered.filter((game) => game.release_date.toLowerCase().includes(year));
      }

      if (rating) {
        filtered = filtered.filter((game) => game.metacritic_score >= Number(rating));
      }

      return filtered;
    });

    return NextResponse.json({ results: data });
  } catch (error) {
    console.error('Games search proxy error:', error);
    return NextResponse.json({ error: error.message, results: [] }, { status: 500 });
  }
}

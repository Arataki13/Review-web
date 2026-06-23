import { NextResponse } from 'next/server';
import { withCache } from '@/lib/cache';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const page = searchParams.get('page') || '1';

  const cacheKey = `tvshows_search_${q}_${page}`;
  const token = process.env.NEXT_PUBLIC_TMDB_TOKEN || process.env.TMDB_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'TMDB API token is not configured on the server.' }, { status: 500 });
  }

  try {
    const data = await withCache(cacheKey, async () => {
      const url = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(q)}&page=${page}&include_adult=false&language=en-US`;
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`TMDB returned status ${res.status}`);
      }

      const rawData = await res.json();
      
      const results = (rawData.results || []).map((item) => ({
        id: item.id,
        name: item.name,
        poster_path: item.poster_path,
        vote_average: item.vote_average || 0,
        overview: item.overview || '',
        first_air_date: item.first_air_date || '',
      }));

      return { results };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('TV shows search proxy error:', error);
    return NextResponse.json({ error: error.message, results: [] }, { status: 500 });
  }
}

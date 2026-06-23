import { NextResponse } from 'next/server';
import { withCache } from '@/lib/cache';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const year = searchParams.get('year') || '';
  const rating = searchParams.get('rating') || '';
  const page = searchParams.get('page') || '1';

  // Construct cache key based on query parameters
  const cacheKey = `movies_search_${q}_${genre}_${year}_${rating}_${page}`;

  const token = process.env.NEXT_PUBLIC_TMDB_TOKEN || process.env.TMDB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'TMDB API token is not configured on the server.' }, { status: 500 });
  }

  try {
    const data = await withCache(cacheKey, async () => {
      let url = '';
      if (q) {
        url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&page=${page}&include_adult=false&language=en-US`;
      } else {
        url = `https://api.themoviedb.org/3/discover/movie?page=${page}&sort_by=popularity.desc&include_adult=false&language=en-US`;
        if (genre) {
          url += `&with_genres=${encodeURIComponent(genre)}`;
        }
        if (year) {
          url += `&primary_release_year=${encodeURIComponent(year)}`;
        }
        if (rating) {
          url += `&vote_average.gte=${encodeURIComponent(rating)}`;
        }
      }

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
      
      // Map results to only include required fields
      let results = (rawData.results || []).map((item) => ({
        id: item.id,
        title: item.title,
        poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        backdrop_url: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
        release_date: item.release_date || '',
        vote_average: item.vote_average || 0,
        overview: item.overview || '',
        genre_ids: item.genre_ids || [],
      }));

      // In-memory filter if search query is used (TMDB search API doesn't support discovers filters on query)
      if (q) {
        if (genre) {
          const genreIds = genre.split(',').map(Number);
          results = results.filter((item) =>
            genreIds.every((gId) => item.genre_ids.includes(gId))
          );
        }
        if (year) {
          results = results.filter((item) => item.release_date.startsWith(year));
        }
        if (rating) {
          results = results.filter((item) => item.vote_average >= Number(rating));
        }
      }

      return {
        results,
        page: rawData.page,
        total_pages: rawData.total_pages,
        total_results: rawData.total_results,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Movies search proxy error:', error);
    return NextResponse.json({ error: error.message, results: [] }, { status: 500 });
  }
}

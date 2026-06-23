import { NextResponse } from 'next/server';
import { withCache } from '@/lib/cache';

export async function GET(request, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Missing movie ID' }, { status: 400 });
  }

  const cacheKey = `movie_details_${id}`;
  const token = process.env.NEXT_PUBLIC_TMDB_TOKEN || process.env.TMDB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'TMDB API token is not configured on the server.' }, { status: 500 });
  }

  try {
    const data = await withCache(cacheKey, async () => {
      const url = `https://api.themoviedb.org/3/movie/${id}?append_to_response=credits,videos&language=en-US`;
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Movie not found');
        }
        throw new Error(`TMDB returned status ${res.status}`);
      }

      const raw = await res.json();

      // Find the trailer link (YouTube video of type 'Trailer')
      let trailer_url = null;
      if (raw.videos && raw.videos.results) {
        const trailer = raw.videos.results.find(
          (v) => v.site === 'YouTube' && v.type === 'Trailer'
        ) || raw.videos.results.find((v) => v.site === 'YouTube');
        
        if (trailer) {
          trailer_url = `https://www.youtube.com/embed/${trailer.key}`;
        }
      }

      // Format Cast (top 8 members)
      const cast = (raw.credits?.cast || []).slice(0, 8).map((member) => ({
        id: member.id,
        name: member.name,
        character: member.character,
        profile_url: member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : null,
      }));

      return {
        id: raw.id,
        title: raw.title,
        overview: raw.overview || '',
        release_date: raw.release_date || '',
        genres: (raw.genres || []).map((g) => g.name),
        vote_average: raw.vote_average || 0,
        runtime: raw.runtime || 0,
        poster_url: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null,
        backdrop_url: raw.backdrop_path ? `https://image.tmdb.org/t/p/w1280${raw.backdrop_path}` : null,
        cast,
        trailer_url,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Movie details proxy error for ID ${id}:`, error);
    const status = error.message === 'Movie not found' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

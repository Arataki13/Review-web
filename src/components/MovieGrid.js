'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Star, Calendar, AlertCircle, Film, ArrowRight } from 'lucide-react';

const MOVIE_GENRES = [
  { id: '', name: 'All Genres' },
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '18', name: 'Drama' },
  { id: '14', name: 'Fantasy' },
  { id: '27', name: 'Horror' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Sci-Fi' },
  { id: '53', name: 'Thriller' }
];

export default function MovieGrid() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch movies when filters change
  useEffect(() => {
    fetchMovies(false);
  }, [debouncedQuery, selectedGenre, selectedYear, minRating]);

  // Fetch more movies when page changes
  useEffect(() => {
    if (page > 1) {
      fetchMovies(true);
    }
  }, [page]);

  const fetchMovies = async (append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError('');
    }

    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.append('q', debouncedQuery);
      if (selectedGenre) params.append('genre', selectedGenre);
      if (selectedYear) params.append('year', selectedYear);
      if (minRating) params.append('rating', minRating);
      params.append('page', String(page));

      const res = await fetch(`/api/movies/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Could not fetch movies catalog. Please try again later.');
      }

      const data = await res.json();
      
      if (append) {
        setMovies((prev) => [...prev, ...(data.results || [])]);
      } else {
        setMovies(data.results || []);
      }
      
      // Determine if there are more pages
      setHasMore(data.page < data.total_pages);
    } catch (err) {
      console.error('Error loading movies:', err);
      setError(err.message || 'Something went wrong while fetching movies.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Generate years list
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1980; y--) {
    years.push(String(y));
  }

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=3540&auto=format&fit=crop'; // Cinematic fallback placeholder
  };

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Genre */}
        <div>
          <select
            value={selectedGenre}
            onChange={(e) => { setSelectedGenre(e.target.value); setPage(1); }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition"
          >
            {MOVIE_GENRES.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <select
            value={selectedYear}
            onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Min Rating */}
        <div>
          <select
            value={minRating}
            onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="">Any Rating</option>
            <option value="8">8+ (Excellent)</option>
            <option value="7">7+ (Good)</option>
            <option value="6">6+ (Decent)</option>
            <option value="5">5+ (Average)</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-zinc-950"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                <div className="h-3 bg-zinc-800 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center px-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-200">Unable to load movies</h3>
          <p className="text-zinc-400 text-sm mt-1 max-w-md">{error}</p>
          <button
            onClick={() => fetchMovies(false)}
            className="mt-6 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs px-4 py-2 rounded-xl transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Movie Grid List */}
      {!loading && !error && (
        <>
          {movies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="group bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition duration-300 flex flex-col h-full"
                >
                  <div className="aspect-[2/3] bg-zinc-950 relative overflow-hidden">
                    {movie.poster_url ? (
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        loading="lazy"
                        onError={handleImageError}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-zinc-500">
                        <Film className="w-8 h-8 mb-2 text-zinc-700" />
                        <span className="text-xs font-semibold">{movie.title}</span>
                        <span className="text-[10px] text-zinc-600 mt-1">No Image Available</span>
                      </div>
                    )}
                    {movie.vote_average > 0 && (
                      <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-zinc-800 flex items-center space-x-1 shadow-lg">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold text-zinc-200">
                          {Number(movie.vote_average).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-1" title={movie.title}>
                        {movie.title}
                      </h3>
                      {movie.release_date && (
                        <div className="flex items-center space-x-1 text-[10px] text-zinc-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{movie.release_date.split('-')[0]}</span>
                        </div>
                      )}
                      <p className="text-[11px] text-zinc-400 font-light mt-2 line-clamp-3 leading-relaxed">
                        {movie.overview || 'No description available.'}
                      </p>
                    </div>

                    <div className="flex items-center text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-4 group-hover:text-indigo-300">
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-900/10 border border-zinc-800/60 rounded-3xl">
              <Film className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-300">No movies found</h3>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto mt-1">
                We couldn't find any movies matching your search or filters. Try adjusting your settings.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && movies.length > 0 && (
            <div className="flex justify-center pt-8 border-t border-zinc-800/40">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loadingMore}
                className="flex items-center bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-850 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
              >
                {loadingMore ? 'Loading More...' : 'Load More Movies'}
              </button>
            </div>
          )}
        </>
      )}

      {/* TMDB Credit & Attribution */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-12 border-t border-zinc-900 text-center">
        <img
          src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d53f5d514391ad1112c93e0e568133f6e8e24213a793c683b28d2d1d7639d601.svg"
          alt="TMDB Logo"
          className="h-6 opacity-30 hover:opacity-50 transition"
        />
        <span className="text-[10px] text-zinc-500 font-light max-w-md">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </span>
      </div>
    </div>
  );
}

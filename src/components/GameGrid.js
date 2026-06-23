'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Monitor, AlertCircle, Gamepad2, ArrowRight } from 'lucide-react';

const GAME_GENRES = [
  { id: '', name: 'All Genres' },
  { id: 'Action', name: 'Action' },
  { id: 'Adventure', name: 'Adventure' },
  { id: 'Casual', name: 'Casual' },
  { id: 'Indie', name: 'Indie' },
  { id: 'RPG', name: 'RPG' },
  { id: 'Simulation', name: 'Simulation' },
  { id: 'Strategy', name: 'Strategy' },
];

export default function GameGrid() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch games when filters change
  useEffect(() => {
    fetchGames();
  }, [debouncedQuery, selectedGenre, selectedYear, selectedPlatform]);

  const fetchGames = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.append('q', debouncedQuery);
      if (selectedGenre) params.append('genre', selectedGenre);
      if (selectedYear) params.append('year', selectedYear);

      const res = await fetch(`/api/games/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Could not fetch Steam games catalog. Please try again later.');
      }

      const data = await res.json();
      
      let results = data.results || [];

      // Platform filter on the client side since Steam API is resolved
      if (selectedPlatform) {
        results = results.filter((game) =>
          game.platforms && game.platforms.includes(selectedPlatform)
        );
      }

      setGames(results);
    } catch (err) {
      console.error('Error loading games:', err);
      setError(err.message || 'Something went wrong while fetching games.');
    } finally {
      setLoading(false);
    }
  };

  // Generate years list
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2010; y--) {
    years.push(String(y));
  }

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=300&auto=format&fit=crop'; // Game room placeholder
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
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Genre */}
        <div>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition"
          >
            {GAME_GENRES.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Platform */}
        <div>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="">All Platforms</option>
            <option value="Windows">Windows</option>
            <option value="macOS">macOS</option>
            <option value="Linux">Linux</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[460/215] bg-zinc-950"></div>
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
          <h3 className="text-lg font-semibold text-zinc-200">Unable to load games</h3>
          <p className="text-zinc-400 text-sm mt-1 max-w-md">{error}</p>
          <button
            onClick={fetchGames}
            className="mt-6 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs px-4 py-2 rounded-xl transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Game Grid List */}
      {!loading && !error && (
        <>
          {games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="group bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition duration-300 flex flex-col h-full"
                >
                  <div className="aspect-[460/215] bg-zinc-950 relative overflow-hidden">
                    {game.header_url || game.capsule_url ? (
                      <img
                        src={game.header_url || game.capsule_url}
                        alt={game.title}
                        loading="lazy"
                        onError={handleImageError}
                        className="w-full h-full object-cover object-center group-hover:scale-103 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-zinc-500">
                        <Gamepad2 className="w-8 h-8 mb-2 text-zinc-700" />
                        <span className="text-xs font-semibold">{game.title}</span>
                      </div>
                    )}
                    
                    {/* Metacritic Badge */}
                    {game.metacritic_score && (
                      <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-zinc-800 flex items-center space-x-1 shadow-lg">
                        <span className={`text-[10px] font-black px-1 rounded ${
                          game.metacritic_score >= 75 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 
                          game.metacritic_score >= 50 ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 
                          'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                        }`}>
                          {game.metacritic_score}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="text-base font-extrabold text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-1" title={game.title}>
                          {game.title}
                        </h3>
                        <span className="text-xs font-bold text-zinc-200 bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded-md flex-shrink-0">
                          {game.price}
                        </span>
                      </div>

                      {/* Genres and Platforms */}
                      <div className="flex flex-wrap gap-1.5 items-center mt-2">
                        {game.platforms && game.platforms.map((platform) => (
                          <span key={platform} className="inline-flex items-center text-[9px] font-bold text-zinc-400 bg-zinc-950 border border-zinc-850/60 px-1.5 py-0.5 rounded">
                            <Monitor className="w-2.5 h-2.5 mr-0.5" />
                            {platform}
                          </span>
                        ))}
                      </div>

                      {game.genres && game.genres.length > 0 && (
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase mt-3">
                          {game.genres.slice(0, 3).join(' • ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-5 group-hover:text-indigo-300">
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-900/10 border border-zinc-800/60 rounded-3xl">
              <Gamepad2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-300">No games found</h3>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto mt-1">
                We couldn't find any Steam games matching your search or filters. Try adjusting your settings.
              </p>
            </div>
          )}
        </>
      )}

      {/* Steam Credit & Attribution */}
      <div className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] text-zinc-500 font-light">
          Powered by Steam. This product is not affiliated with, nor authorized, sponsored, or licensed in any way by Valve Corporation.
        </p>
      </div>
    </div>
  );
}

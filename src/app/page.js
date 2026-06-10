'use client';

import React, { useState, useEffect } from 'react';
import { useModal } from '@/context/ModalContext';
import { supabase } from '@/lib/supabase';
import Card from '@/components/Card';
import { Film, Tv, Gamepad2, Search, Plus, Play, CheckCircle2, Bookmark, AlertCircle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { openModal, refreshTrigger, deleteEntry } = useModal();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    movie: { finished: 0, wishlist: 0, current: 0, dropped: 0, total: 0 },
    tvshow: { finished: 0, wishlist: 0, current: 0, dropped: 0, total: 0 },
    game: { finished: 0, wishlist: 0, current: 0, dropped: 0, total: 0 },
    total: 0,
  });

  useEffect(() => {
    fetchEntries();
  }, [refreshTrigger]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEntries(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error('Error fetching dashboard entries:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const newStats = {
      movie: { finished: 0, wishlist: 0, current: 0, dropped: 0, total: 0 },
      tvshow: { finished: 0, wishlist: 0, current: 0, dropped: 0, total: 0 },
      game: { finished: 0, wishlist: 0, current: 0, dropped: 0, total: 0 },
      total: data.length,
    };

    data.forEach((entry) => {
      const cat = entry.category; // movie, tvshow, game
      const stat = entry.status; // finished, wishlist, current, dropped

      if (newStats[cat]) {
        newStats[cat].total += 1;
        if (newStats[cat][stat] !== undefined) {
          newStats[cat][stat] += 1;
        }
      }
    });

    setStats(newStats);
  };

  const filteredEntries = searchQuery.trim()
    ? entries.filter((entry) =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const recentEntries = entries.slice(0, 5);

  const getProgressPercent = (categoryStats) => {
    if (categoryStats.total === 0) return 0;
    return Math.round((categoryStats.finished / categoryStats.total) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">Media Dashboard</h1>
          <p className="text-zinc-400 mt-1">Track and manage your movies, TV shows, and games in one place.</p>
        </div>
        <button
          onClick={() => openModal(null, 'movie')}
          className="flex items-center self-start md:self-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Entry
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Movies Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-zinc-700 transition">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition duration-300">
            <Film className="w-24 h-24 text-indigo-400" />
          </div>
          <div className="flex items-center space-x-3 text-zinc-400 font-semibold mb-4">
            <Film className="w-5 h-5 text-indigo-400" />
            <span>Movies</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-zinc-100">{stats.movie.total}</span>
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-zinc-400">
            <div className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
              <span>{stats.movie.finished} Finished</span>
            </div>
            <div className="flex items-center">
              <Play className="w-3.5 h-3.5 text-violet-500 mr-1.5" />
              <span>{stats.movie.current} Watching</span>
            </div>
            <div className="flex items-center">
              <Bookmark className="w-3.5 h-3.5 text-sky-500 mr-1.5" />
              <span>{stats.movie.wishlist} Wishlist</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
              <span>{stats.movie.dropped} Dropped</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-5">
            <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
              <span>Completion Progress</span>
              <span>{getProgressPercent(stats.movie)}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800/40">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercent(stats.movie)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* TV Shows Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-zinc-700 transition">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition duration-300">
            <Tv className="w-24 h-24 text-indigo-400" />
          </div>
          <div className="flex items-center space-x-3 text-zinc-400 font-semibold mb-4">
            <Tv className="w-5 h-5 text-indigo-400" />
            <span>TV Shows</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-zinc-100">{stats.tvshow.total}</span>
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-zinc-400">
            <div className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
              <span>{stats.tvshow.finished} Finished</span>
            </div>
            <div className="flex items-center">
              <Play className="w-3.5 h-3.5 text-violet-500 mr-1.5" />
              <span>{stats.tvshow.current} Watching</span>
            </div>
            <div className="flex items-center">
              <Bookmark className="w-3.5 h-3.5 text-sky-500 mr-1.5" />
              <span>{stats.tvshow.wishlist} Wishlist</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
              <span>{stats.tvshow.dropped} Dropped</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-5">
            <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
              <span>Completion Progress</span>
              <span>{getProgressPercent(stats.tvshow)}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800/40">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercent(stats.tvshow)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Games Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-zinc-700 transition">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition duration-300">
            <Gamepad2 className="w-24 h-24 text-indigo-400" />
          </div>
          <div className="flex items-center space-x-3 text-zinc-400 font-semibold mb-4">
            <Gamepad2 className="w-5 h-5 text-indigo-400" />
            <span>Games</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-zinc-100">{stats.game.total}</span>
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-zinc-400">
            <div className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
              <span>{stats.game.finished} Completed</span>
            </div>
            <div className="flex items-center">
              <Play className="w-3.5 h-3.5 text-violet-500 mr-1.5" />
              <span>{stats.game.current} Playing</span>
            </div>
            <div className="flex items-center">
              <Bookmark className="w-3.5 h-3.5 text-sky-500 mr-1.5" />
              <span>{stats.game.wishlist} Wishlist</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
              <span>{stats.game.dropped} Dropped</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-5">
            <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
              <span>Completion Progress</span>
              <span>{getProgressPercent(stats.game)}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800/40">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercent(stats.game)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search all titles globally..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 shadow-inner transition"
        />
      </div>

      {/* Conditionally render search results or recent items */}
      {searchQuery.trim() ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-100">
              Search Results ({filteredEntries.length})
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-zinc-400 hover:text-zinc-100 underline"
            >
              Clear Search
            </button>
          </div>
          {filteredEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  entry={entry}
                  onEdit={(e) => openModal(e, e.category)}
                  onDelete={deleteEntry}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-900/20 border border-zinc-800/40 rounded-2xl text-zinc-500">
              No entries match "{searchQuery}"
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recent Additions */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Recent Additions</span>
            </h2>
            {entries.length > 5 && (
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                Showing latest 5 items
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl h-44 animate-pulse"
                ></div>
              ))}
            </div>
          ) : entries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentEntries.map((entry) => (
                <Card
                  key={entry.id}
                  entry={entry}
                  onEdit={(e) => openModal(e, e.category)}
                  onDelete={deleteEntry}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
              <Film className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-300">Your tracker is empty</h3>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto mt-1 mb-6">
                Start tracking your movies, TV shows, and games to view your dashboard statistics here.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => openModal(null, 'movie')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition"
                >
                  Add Entry
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import CategoryPage from '@/components/CategoryPage';
import MovieGrid from '@/components/MovieGrid';
import { Compass, Bookmark } from 'lucide-react';

export default function MoviesPage() {
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' or 'tracker'

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header */}
      <div className="flex items-center space-x-2 p-1 bg-zinc-950 border border-zinc-900 rounded-2xl w-fit self-start mb-4">
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 ${
            activeTab === 'explore'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Explore Catalog</span>
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 ${
            activeTab === 'tracker'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>My Tracker List</span>
        </button>
      </div>

      {/* Render selected view */}
      {activeTab === 'explore' ? (
        <div>
          <div className="pb-6 border-b border-zinc-800/60 mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">Discover Movies</h1>
            <p className="text-zinc-400 mt-1">Browse and search movies to decide what to watch.</p>
          </div>
          <MovieGrid />
        </div>
      ) : (
        <CategoryPage category="movie" title="Movies Tracker" />
      )}
    </div>
  );
}

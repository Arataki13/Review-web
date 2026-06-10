'use client';

import React, { useState, useEffect } from 'react';
import { useModal } from '@/context/ModalContext';
import { supabase } from '@/lib/supabase';
import Card from '@/components/Card';
import { Film, Tv, Gamepad2, Plus, Search, HelpCircle } from 'lucide-react';

export default function CategoryPage({ category, title }) {
  const { openModal, refreshTrigger, deleteEntry } = useModal();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const Icon = {
    movie: Film,
    tvshow: Tv,
    game: Gamepad2,
  }[category] || HelpCircle;

  useEffect(() => {
    fetchEntries();
  }, [refreshTrigger, category]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error(`Error fetching ${category} entries:`, err.message);
    } finally {
      setLoading(false);
    }
  };

  // Status filtering mapping
  const getFilterCount = (status) => {
    if (status === 'all') return entries.length;
    return entries.filter((e) => e.status === status).count || entries.filter((e) => e.status === status).length;
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'finished', label: 'Finished' },
    { id: 'current', label: category === 'game' ? 'Playing' : 'Watching' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'dropped', label: 'Dropped' },
  ];

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">{title}</h1>
            <p className="text-zinc-400 mt-1">Manage and track your {title.toLowerCase()}.</p>
          </div>
        </div>
        <button
          onClick={() => openModal(null, category)}
          className="flex items-center self-start md:self-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {title.replace(/s$/, '')}
        </button>
      </div>

      {/* Toolbar: Search + Filter Tabs */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()} by title...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 shadow-inner transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 p-1 bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-x-auto">
          {filterTabs.map((tab) => {
            const count = getFilterCount(tab.id);
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition whitespace-nowrap ${
                  active
                    ? 'bg-zinc-905 bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    active ? 'bg-indigo-500 text-indigo-100' : 'bg-zinc-900 text-zinc-500 border border-zinc-800/40'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl h-44 animate-pulse"
            ></div>
          ))}
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              entry={entry}
              onEdit={(e) => openModal(e, category)}
              onDelete={deleteEntry}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/20 border border-zinc-800/60 rounded-3xl">
          <HelpCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-300">No entries found</h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto mt-1 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try modifying your filters or search terms to find entries.'
              : `You haven't added any ${title.toLowerCase()} to your tracker yet.`}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={() => openModal(null, category)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition"
            >
              Add Your First {title.replace(/s$/, '')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

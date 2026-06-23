'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Star, Monitor, Calendar, ArrowLeft, Plus, CheckCircle, Trash2, Heart, Award, ArrowLeftRight, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function GameDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [game, setGame] = useState(null);
  const [trackedEntry, setTrackedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeScreenshot, setActiveScreenshot] = useState('');

  // Form states for tracking
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState('wishlist');
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadDetails();
    }
  }, [id]);

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch game details from backend proxy
      const gameRes = await fetch(`/api/games/${id}`);
      if (!gameRes.ok) {
        throw new Error('Could not load game details from Steam.');
      }
      const gameData = await gameRes.json();
      setGame(gameData);
      
      // Default to first screenshot if available
      if (gameData.screenshots && gameData.screenshots.length > 0) {
        setActiveScreenshot(gameData.screenshots[0]);
      }

      // 2. Fetch tracker entry from Supabase
      const { data, error: supabaseError } = await supabase
        .from('entries')
        .select('*')
        .eq('external_id', String(id))
        .eq('category', 'game')
        .maybeSingle();

      if (supabaseError) throw supabaseError;

      if (data) {
        setTrackedEntry(data);
        setIsTracking(true);
        setStatus(data.status || 'wishlist');
        setRating(data.rating || 0);
        setNote(data.note || '');
      } else {
        setTrackedEntry(null);
        setIsTracking(false);
        setStatus('wishlist');
        setRating(0);
        setNote('');
      }
    } catch (err) {
      console.error('Error loading game details:', err);
      setError(err.message || 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!game) return;
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to track media.');

      const entryData = {
        title: game.title,
        category: 'game',
        status,
        rating: rating > 0 ? rating : null,
        note: note.trim() || null,
        poster_url: game.header_url || game.capsule_url,
        description: game.short_description,
        external_id: String(game.id),
        external_rating: game.metacritic_score,
        user_id: user.id
      };

      if (trackedEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('entries')
          .update(entryData)
          .eq('id', trackedEntry.id);
        
        if (updateError) throw updateError;
      } else {
        // Insert new entry
        const { data, error: insertError } = await supabase
          .from('entries')
          .insert([entryData])
          .select()
          .single();

        if (insertError) throw insertError;
        setTrackedEntry(data);
      }

      setIsTracking(true);
      alert('Game successfully saved to your tracker!');
    } catch (err) {
      console.error('Error saving entry:', err);
      alert('Failed to save to tracker: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTracking = async () => {
    if (!trackedEntry) return;
    if (!confirm('Are you sure you want to remove this game from your tracker?')) return;
    setSaving(true);

    try {
      const { error: deleteError } = await supabase
        .from('entries')
        .delete()
        .eq('id', trackedEntry.id);

      if (deleteError) throw deleteError;

      setTrackedEntry(null);
      setIsTracking(false);
      setStatus('wishlist');
      setRating(0);
      setNote('');
      alert('Game removed from your tracker.');
    } catch (err) {
      console.error('Error deleting entry:', err);
      alert('Failed to remove from tracker: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Backdrop Skeleton */}
        <div className="h-64 sm:h-96 bg-zinc-900 border border-zinc-800 rounded-3xl w-full"></div>
        {/* Info Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="aspect-[460/215] bg-zinc-900 border border-zinc-800 rounded-2xl md:col-span-1"></div>
          <div className="md:col-span-2 space-y-4">
            <div className="h-8 bg-zinc-900 rounded w-3/4"></div>
            <div className="h-4 bg-zinc-900 rounded w-1/4"></div>
            <div className="h-20 bg-zinc-900 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-md mx-auto">
        <AlertCircle className="w-14 h-14 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-100">Couldn't load game details</h2>
        <p className="text-zinc-400 text-sm mt-2">{error || 'The requested game could not be found.'}</p>
        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => router.back()}
            className="flex items-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </button>
          <button
            onClick={loadDetails}
            className="bg-indigo-600 hover:bg-indigo-505 text-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-805/60 px-4 py-2 rounded-xl"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Catalog
      </button>

      {/* Hero Banner (Active Screenshot or Header) */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-850 bg-zinc-950 h-64 sm:h-96 shadow-2xl">
        {activeScreenshot ? (
          <img
            src={activeScreenshot}
            alt=""
            className="w-full h-full object-cover object-center opacity-40 transition-all duration-700"
          />
        ) : game.header_url ? (
          <img
            src={game.header_url}
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-950/20 to-zinc-905"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
        
        {/* Absolute header overlay info */}
        <div className="absolute bottom-6 left-6 right-6 sm:left-10 sm:right-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {game.genres && game.genres.map((g) => (
                <span key={g} className="text-[10px] font-black uppercase tracking-wider bg-indigo-600/20 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/10">
                  {g}
                </span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight leading-none">
              {game.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3 self-start md:self-auto">
            {game.metacritic_score && (
              <div className="flex items-center space-x-2 bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-zinc-850 shadow-xl">
                <Award className="w-5 h-5 text-emerald-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-black text-emerald-450">{game.metacritic_score}</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Metacritic</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-end bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-zinc-850 shadow-xl">
              <span className="text-sm font-black text-zinc-105">{game.price}</span>
              <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Price</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Header, details, screenshots */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 p-6 bg-zinc-900/20 border border-zinc-800/40 rounded-3xl">
            {/* Header capsule image */}
            {game.header_url && (
              <div className="w-full md:w-64 rounded-2xl overflow-hidden border border-zinc-850 bg-zinc-950 flex-shrink-0 shadow-lg self-start">
                <img
                  src={game.header_url}
                  alt={game.title}
                  className="w-full h-auto"
                />
              </div>
            )}
            
            {/* Short description & Metadata */}
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap gap-4 text-xs text-zinc-400 font-medium">
                {game.release_date && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-zinc-500" />
                    <span>Released: {game.release_date}</span>
                  </div>
                )}
                {game.platforms && game.platforms.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400">Available on:</span>
                    {game.platforms.map((p) => (
                      <span key={p} className="bg-zinc-850 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-300">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-2">About Game</h3>
                <p className="text-zinc-305 text-sm font-light leading-relaxed">
                  {game.short_description || 'No description available.'}
                </p>
              </div>
            </div>
          </div>

          {/* Screenshots Gallery */}
          {game.screenshots && game.screenshots.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-indigo-400" />
                <span>Screenshots Gallery</span>
              </h3>
              
              <div className="space-y-3">
                {/* Big Preview */}
                <div className="aspect-video rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-lg relative">
                  <img
                    src={activeScreenshot}
                    alt={`${game.title} Screenshot`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                </div>
                
                {/* Thumbnails */}
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
                  {game.screenshots.map((url, idx) => (
                    <button
                      key={url}
                      onClick={() => setActiveScreenshot(url)}
                      className={`relative flex-shrink-0 w-28 aspect-video rounded-xl overflow-hidden border-2 transition ${
                        activeScreenshot === url ? 'border-indigo-500 scale-95 shadow-md shadow-indigo-500/20' : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Description */}
          {game.long_description && (
            <div className="p-6 bg-zinc-900/10 border border-zinc-900/60 rounded-3xl space-y-3">
              <h3 className="text-base font-bold text-zinc-200 uppercase tracking-wider">Detailed Description</h3>
              <p className="text-zinc-400 text-sm font-light leading-relaxed whitespace-pre-line">
                {game.long_description}
              </p>
            </div>
          )}
        </div>

        {/* Right column: Tracking controls */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-850 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-100 flex items-center">
                <Heart className={`w-5 h-5 mr-2 ${isTracking ? 'fill-rose-500 text-rose-500 animate-pulse' : 'text-zinc-500'}`} />
                <span>Tracking Status</span>
              </h3>
              {isTracking && (
                <span className="inline-flex items-center text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Tracked
                </span>
              )}
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Tracker list
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-200 focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="wishlist">Wishlist</option>
                  <option value="current">Playing</option>
                  <option value="finished">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  My rating
                </label>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star === rating ? 0 : star)}
                      className="p-0.5 text-zinc-650 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-[10px] text-zinc-500 font-bold ml-2">({rating}/5 Stars)</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  My Review / Note
                </label>
                <textarea
                  placeholder="What did you think of the game? Add your review..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg shadow-indigo-600/10 active:scale-95 transition disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : (trackedEntry ? 'Update Track Log' : 'Add to My Tracker')}
                </button>

                {isTracking && (
                  <button
                    type="button"
                    onClick={handleDeleteTracking}
                    disabled={saving}
                    className="w-full flex items-center justify-center bg-zinc-950 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-zinc-800/80 hover:border-rose-500/20 font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Tracking
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Steam Credit & Attribution */}
      <div className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] text-zinc-505 font-light">
          Powered by Steam. This product is not affiliated with, nor authorized, sponsored, or licensed in any way by Valve Corporation. All screenshots and game data are from the official Steam Store.
        </p>
      </div>
    </div>
  );
}

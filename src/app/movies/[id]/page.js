'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Star, Clock, Calendar, ArrowLeft, Plus, CheckCircle, Trash2, Edit2, Play, Heart, X, AlertCircle, Film } from 'lucide-react';

export default function MovieDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [movie, setMovie] = useState(null);
  const [trackedEntry, setTrackedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      // 1. Fetch movie details from backend proxy
      const movieRes = await fetch(`/api/movies/${id}`);
      if (!movieRes.ok) {
        throw new Error('Could not load movie details from TMDB.');
      }
      const movieData = await movieRes.json();
      setMovie(movieData);

      // 2. Fetch tracker entry from Supabase
      const { data, error: supabaseError } = await supabase
        .from('entries')
        .select('*')
        .eq('external_id', String(id))
        .eq('category', 'movie')
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
      console.error('Error loading movie details:', err);
      setError(err.message || 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!movie) return;
    setSaving(true);

    try {
      const entryData = {
        title: movie.title,
        category: 'movie',
        status,
        rating: rating > 0 ? rating : null,
        note: note.trim() || null,
        poster_url: movie.poster_url,
        description: movie.overview,
        external_id: String(movie.id),
        external_rating: movie.vote_average,
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
      alert('Movie successfully saved to your tracker!');
    } catch (err) {
      console.error('Error saving entry:', err);
      alert('Failed to save to tracker: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTracking = async () => {
    if (!trackedEntry) return;
    if (!confirm('Are you sure you want to remove this movie from your tracker?')) return;
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
      alert('Movie removed from your tracker.');
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
          <div className="aspect-[2/3] bg-zinc-900 border border-zinc-800 rounded-2xl md:col-span-1"></div>
          <div className="md:col-span-2 space-y-4">
            <div className="h-8 bg-zinc-900 rounded w-3/4"></div>
            <div className="h-4 bg-zinc-900 rounded w-1/4"></div>
            <div className="h-20 bg-zinc-900 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-md mx-auto">
        <AlertCircle className="w-14 h-14 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-100">Couldn't load movie details</h2>
        <p className="text-zinc-400 text-sm mt-2">{error || 'The requested movie could not be found.'}</p>
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

  const formatMovieDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

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

      {/* Hero Poster / Backdrop Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 h-64 sm:h-96 shadow-2xl">
        {movie.backdrop_url ? (
          <img
            src={movie.backdrop_url}
            alt=""
            className="w-full h-full object-cover object-top opacity-30"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-950/20 to-zinc-905"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
        
        {/* Absolute header overlay info */}
        <div className="absolute bottom-6 left-6 right-6 sm:left-10 sm:right-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {movie.genres && movie.genres.map((g) => (
                <span key={g} className="text-[10px] font-black uppercase tracking-wider bg-indigo-600/20 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/10">
                  {g}
                </span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight leading-none">
              {movie.title}
            </h1>
          </div>
          
          {movie.vote_average > 0 && (
            <div className="flex items-center space-x-2 bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-zinc-850 self-start md:self-auto shadow-xl">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-sm font-black text-zinc-100">{Number(movie.vote_average).toFixed(1)}/10</span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">TMDB Rating</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Poster + Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 p-6 bg-zinc-900/20 border border-zinc-800/40 rounded-3xl">
            {/* Poster */}
            {movie.poster_url && (
              <div className="w-full md:w-56 aspect-[2/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex-shrink-0 shadow-lg">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Overview & Metadata */}
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap gap-4 text-xs text-zinc-400 font-medium">
                {movie.release_date && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-zinc-500" />
                    <span>Released: {formatMovieDate(movie.release_date)}</span>
                  </div>
                )}
                {movie.runtime > 0 && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-zinc-500" />
                    <span>{movie.runtime} mins</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-2">Overview</h3>
                <p className="text-zinc-300 text-sm font-light leading-relaxed">
                  {movie.overview || 'No overview available for this movie.'}
                </p>
              </div>
            </div>
          </div>

          {/* Cast Section */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center">
                <Film className="w-5 h-5 mr-2 text-indigo-400" />
                <span>Top Cast</span>
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {movie.cast.map((member) => (
                  <div key={member.id} className="bg-zinc-900 border border-zinc-850 p-3 rounded-2xl flex items-center space-x-3">
                    {member.profile_url ? (
                      <img
                        src={member.profile_url}
                        alt={member.name}
                        loading="lazy"
                        className="w-10 h-10 object-cover rounded-xl bg-zinc-800 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-855 flex items-center justify-center text-xs text-zinc-600 font-bold flex-shrink-0">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-200 truncate" title={member.name}>{member.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate" title={member.character}>{member.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trailer Embed */}
          {movie.trailer_url && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center">
                <Play className="w-5 h-5 mr-2 text-indigo-400" />
                <span>Trailer Video</span>
              </h3>
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-lg">
                <iframe
                  src={movie.trailer_url}
                  title={`${movie.title} Official Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Tracking controls */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
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
                  <option value="current">Watching</option>
                  <option value="finished">Finished</option>
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
                  placeholder="What did you think of the movie? Add your review..."
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

      {/* Attributions */}
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

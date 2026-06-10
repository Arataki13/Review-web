import React, { useState, useEffect } from 'react';
import { X, Star, Search, Loader2 } from 'lucide-react';

export default function EntryModal({ isOpen, onClose, onSave, entry = null, defaultCategory = 'movie' }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('movie');
  const [status, setStatus] = useState('wishlist');
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // API fields
  const [posterUrl, setPosterUrl] = useState('');
  const [description, setDescription] = useState('');
  const [externalId, setExternalId] = useState('');
  const [externalRating, setExternalRating] = useState(null);

  // Search autocomplete states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setCategory(entry.category || 'movie');
      setStatus(entry.status || 'wishlist');
      setRating(entry.rating || 0);
      setNote(entry.note || '');
      setPosterUrl(entry.poster_url || '');
      setDescription(entry.description || '');
      setExternalId(entry.external_id || '');
      setExternalRating(entry.external_rating || null);
    } else {
      setTitle('');
      setCategory(defaultCategory);
      setStatus('wishlist');
      setRating(0);
      setNote('');
      setPosterUrl('');
      setDescription('');
      setExternalId('');
      setExternalRating(null);
    }
    setSearchQuery('');
    setSuggestions([]);
    setError('');
  }, [entry, defaultCategory, isOpen]);

  // Debounced autocomplete fetch hook
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      performSearch(searchQuery);
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, category]);

  const performSearch = async (query) => {
    setSearching(true);
    try {
      if (category === 'movie' || category === 'tvshow') {
        const token = process.env.NEXT_PUBLIC_TMDB_TOKEN;
        if (!token || token === 'your-tmdb-bearer-token-here') {
          console.warn('TMDB token is missing or default placeholder');
          setSuggestions([]);
          return;
        }
        const endpoint = category === 'movie' ? 'movie' : 'tv';
        const res = await fetch(
          `https://api.themoviedb.org/3/search/${endpoint}?query=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );
        if (!res.ok) throw new Error('TMDB request failed');
        const data = await res.json();
        setSuggestions(data.results || []);
      } else if (category === 'game') {
        const res = await fetch(`/api/steam/search?term=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Steam proxy request failed');
        const data = await res.json();
        setSuggestions(data.items || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const fetchSteamDetails = async (appId) => {
    try {
      const res = await fetch(`/api/steam/details?appid=${appId}`);
      const json = await res.json();
      if (json[appId]?.success) {
        const data = json[appId].data;
        const desc = data.short_description || data.detailed_description || '';
        const genres = data.genres ? `Genres: ${data.genres.map(g => g.description).join(', ')}` : '';
        const finalDesc = genres ? `${genres}\n\n${desc}` : desc;
        // Strip html tags from Steam description
        const cleanDesc = finalDesc.replace(/<[^>]*>/g, '');
        return cleanDesc;
      }
    } catch (err) {
      console.error('Error fetching Steam details:', err);
    }
    return '';
  };

  const handleSelectSuggestion = async (item) => {
    setSuggestions([]);
    setSearchQuery('');
    
    if (category === 'movie' || category === 'tvshow') {
      const isMovie = category === 'movie';
      const itemTitle = isMovie ? item.title : item.name;
      
      setTitle(itemTitle);
      setExternalId(String(item.id));
      setExternalRating(item.vote_average ? Number(item.vote_average) : null);
      setDescription(item.overview || '');
      setPosterUrl(item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '');
    } else if (category === 'game') {
      setTitle(item.name);
      setExternalId(String(item.id));
      setExternalRating(item.metascore ? Number(item.metascore) : null);
      setPosterUrl(`https://cdn.akamai.steamstatic.com/steam/apps/${item.id}/header.jpg`);
      
      // Fetch details asynchronously for short description
      setSearching(true);
      const cleanDesc = await fetchSteamDetails(item.id);
      setDescription(cleanDesc);
      setSearching(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    onSave({
      id: entry?.id,
      title: title.trim(),
      category,
      status,
      rating: rating > 0 ? rating : null,
      note: note.trim() || null,
      poster_url: posterUrl || null,
      description: description || null,
      external_id: externalId || null,
      external_rating: externalRating,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1 hover:bg-zinc-800 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 pr-6">
          {entry ? 'Edit Entry' : 'Add New Entry'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSearchQuery('');
                  setSuggestions([]);
                  setPosterUrl('');
                  setDescription('');
                  setExternalId('');
                  setExternalRating(null);
                }}
                disabled={!!entry}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
              >
                <option value="movie">Movie</option>
                <option value="tvshow">TV Show</option>
                <option value="game">Game</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="finished">Finished</option>
                <option value="wishlist">Wishlist</option>
                <option value="current">Currently</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </div>

          {/* Autocomplete Search Bar (Only when adding a new entry) */}
          {!entry && (
            <div className="relative">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Search API for autofill
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Type title to search ${category === 'game' ? 'Steam' : 'TMDB'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                {searching && (
                  <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto bg-zinc-950 border border-zinc-850 rounded-xl shadow-2xl p-1.5 space-y-1">
                  {suggestions.map((item) => {
                    const isGame = category === 'game';
                    const itemId = item.id;
                    const itemTitle = isGame ? item.name : (item.title || item.name);
                    const releaseDate = isGame ? '' : (item.release_date || item.first_air_date || '');
                    const year = releaseDate ? ` (${releaseDate.split('-')[0]})` : '';
                    
                    const thumbUrl = isGame 
                      ? item.tiny_image 
                      : (item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : '');

                    return (
                      <button
                        type="button"
                        key={itemId}
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full flex items-center space-x-3 p-2 rounded-lg text-left hover:bg-zinc-900 transition"
                      >
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt=""
                            className="w-8 h-10 object-cover rounded bg-zinc-800 flex-shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-8 h-10 rounded bg-zinc-800 flex-shrink-0 flex items-center justify-center text-[10px] text-zinc-500">
                            N/A
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-100 truncate">{itemTitle}</p>
                          <p className="text-xs text-zinc-500">
                            {isGame ? `AppID: ${itemId}` : `${category === 'movie' ? 'Movie' : 'TV Show'}${year}`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Autofill Preview */}
          {posterUrl && (
            <div className="flex items-start space-x-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
              <img
                src={posterUrl}
                alt="Cover preview"
                className="w-16 h-20 object-cover rounded-lg border border-zinc-800 bg-zinc-900"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">API Match Details</h4>
                <p className="text-sm font-semibold text-zinc-100 truncate">{title}</p>
                {externalRating && (
                  <p className="text-xs text-indigo-400 font-medium mt-1">
                    {category === 'game' ? 'Steam Metascore' : 'TMDB Rating'}: {externalRating}
                  </p>
                )}
                {!entry && (
                  <button
                    type="button"
                    onClick={() => {
                      setPosterUrl('');
                      setDescription('');
                      setExternalId('');
                      setExternalRating(null);
                    }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 underline mt-2"
                  >
                    Clear Match & Edit Manually
                  </button>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              My Rating
            </label>
            <div className="flex items-center space-x-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star === rating ? 0 : star)}
                  className="p-0.5 text-zinc-600 hover:scale-110 transition"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-xs text-zinc-400 ml-2">({rating} / 5 stars)</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Note (My Review)
            </label>
            <textarea
              placeholder="Add your review or notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-4 py-2 rounded-xl text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-lg shadow-indigo-600/20 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

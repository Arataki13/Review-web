import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';

export default function EntryModal({ isOpen, onClose, onSave, entry = null, defaultCategory = 'movie' }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('movie');
  const [status, setStatus] = useState('wishlist');
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setCategory(entry.category || 'movie');
      setStatus(entry.status || 'wishlist');
      setRating(entry.rating || 0);
      setNote(entry.note || '');
    } else {
      setTitle('');
      setCategory(defaultCategory);
      setStatus('wishlist');
      setRating(0);
      setNote('');
    }
    setError('');
  }, [entry, defaultCategory, isOpen]);

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
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 text-zinc-100 transform transition-all duration-300">
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

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="movie">Movie</option>
              <option value="tvshow">TV Show</option>
              <option value="game">Game</option>
            </select>
          </div>

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
              autoFocus
            />
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

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Rating
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
              Note
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

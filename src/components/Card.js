import React from 'react';
import { Star, Pencil, Trash2, Film, Tv, Gamepad2, Calendar } from 'lucide-react';

export default function Card({ entry, onEdit, onDelete }) {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'movie':
        return <Film className="w-4 h-4" />;
      case 'tvshow':
        return <Tv className="w-4 h-4" />;
      case 'game':
        return <Gamepad2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'movie':
        return 'Movie';
      case 'tvshow':
        return 'TV Show';
      case 'game':
        return 'Game';
      default:
        return category;
    }
  };

  const getStatusBadge = (status) => {
    let classes = '';
    let label = '';
    switch (status) {
      case 'finished':
        classes = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        label = 'Finished';
        break;
      case 'wishlist':
        classes = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
        label = 'Wishlist';
        break;
      case 'current':
        classes = 'bg-violet-500/10 text-violet-400 border-violet-500/20';
        label = 'Currently';
        break;
      case 'dropped':
        classes = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        label = 'Dropped';
        break;
      default:
        classes = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        label = status;
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
        {label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-zinc-700 transition duration-200">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2 text-zinc-400 text-xs">
            {getCategoryIcon(entry.category)}
            <span>{getCategoryName(entry.category)}</span>
          </div>
          {getStatusBadge(entry.status)}
        </div>

        <h3 className="text-lg font-semibold text-zinc-100 mb-2 truncate leading-tight" title={entry.title}>
          {entry.title}
        </h3>

        {entry.rating && (
          <div className="flex items-center space-x-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < entry.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                }`}
              />
            ))}
          </div>
        )}

        {entry.note && (
          <p className="text-zinc-400 text-sm italic bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/40 line-clamp-3 mb-4 font-light">
            "{entry.note}"
          </p>
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-zinc-800/80 mt-auto">
        <div className="flex items-center text-zinc-500 text-xs space-x-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(entry.created_at)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

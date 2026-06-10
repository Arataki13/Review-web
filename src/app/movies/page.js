import React from 'react';
import CategoryPage from '@/components/CategoryPage';

export const metadata = {
  title: 'Movies - My Tracker',
};

export default function MoviesPage() {
  return <CategoryPage category="movie" title="Movies" />;
}

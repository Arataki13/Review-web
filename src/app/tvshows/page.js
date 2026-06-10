import React from 'react';
import CategoryPage from '@/components/CategoryPage';

export const metadata = {
  title: 'TV Shows - My Tracker',
};

export default function TvShowsPage() {
  return <CategoryPage category="tvshow" title="TV Shows" />;
}

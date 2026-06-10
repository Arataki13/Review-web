import React from 'react';
import CategoryPage from '@/components/CategoryPage';

export const metadata = {
  title: 'Games - My Tracker',
};

export default function GamesPage() {
  return <CategoryPage category="game" title="Games" />;
}

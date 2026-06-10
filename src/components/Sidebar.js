'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Film, Tv, Gamepad2, Menu, X, Plus } from 'lucide-react';

export default function Sidebar({ onAddClick }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'TV Shows', path: '/tvshows', icon: Tv },
    { name: 'Games', path: '/games', icon: Gamepad2 },
  ];

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800 text-zinc-100 sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
            M
          </div>
          <span className="font-bold tracking-tight text-lg">My Tracker</span>
        </div>
        <div className="flex items-center space-x-4">
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition shadow"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:sticky md:h-screen`}
      >
        <div className="flex flex-col flex-1 py-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 px-6 pb-6 border-b border-zinc-800/50">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-xl shadow-indigo-600/30">
              M
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-zinc-100 text-lg leading-tight">My Tracker</h1>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">Media Log</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 border-l-2 ${
                    active
                      ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border-transparent hover:border-zinc-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Quick Controls / Footer */}
        {onAddClick && (
          <div className="p-4 border-t border-zinc-800/50">
            <button
              onClick={() => {
                setIsMobileOpen(false);
                onAddClick();
              }}
              className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Add Entry
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

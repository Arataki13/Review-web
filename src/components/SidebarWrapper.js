'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { useModal } from '@/context/ModalContext';
import { usePathname } from 'next/navigation';

export default function SidebarWrapper() {
  const { openModal } = useModal();
  const pathname = usePathname();

  // Hide sidebar on the login/signup authentication screen
  if (pathname === '/login') {
    return null;
  }

  return <Sidebar onAddClick={() => openModal(null, 'movie')} />;
}

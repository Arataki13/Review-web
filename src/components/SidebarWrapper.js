'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { useModal } from '@/context/ModalContext';

export default function SidebarWrapper() {
  const { openModal } = useModal();

  return <Sidebar onAddClick={() => openModal(null, 'movie')} />;
}

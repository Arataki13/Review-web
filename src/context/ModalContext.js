'use client';

import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';
import EntryModal from '@/components/EntryModal';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [defaultCategory, setDefaultCategory] = useState('movie');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openModal = (entry = null, defCategory = 'movie') => {
    setEntryToEdit(entry);
    setDefaultCategory(defCategory);
    setIsOpen(true);
  };

  const closeModal = () => {
    setEntryToEdit(null);
    setIsOpen(false);
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const saveEntry = async (entryData) => {
    try {
      if (entryData.id) {
        // Update
        const { error } = await supabase
          .from('entries')
          .update({
            title: entryData.title,
            category: entryData.category,
            status: entryData.status,
            rating: entryData.rating,
            note: entryData.note,
          })
          .eq('id', entryData.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('entries')
          .insert([
            {
              title: entryData.title,
              category: entryData.category,
              status: entryData.status,
              rating: entryData.rating,
              note: entryData.note,
            },
          ]);

        if (error) throw error;
      }
      triggerRefresh();
      closeModal();
    } catch (err) {
      console.error('Error saving entry:', err.message);
      alert('Failed to save entry. Check your Supabase database connection and schema.');
    }
  };

  const deleteEntry = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      const { error } = await supabase.from('entries').delete().eq('id', id);
      if (error) throw error;
      triggerRefresh();
    } catch (err) {
      console.error('Error deleting entry:', err.message);
      alert('Failed to delete entry.');
    }
  };

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        triggerRefresh,
        refreshTrigger,
        deleteEntry,
      }}
    >
      {children}
      <EntryModal
        isOpen={isOpen}
        onClose={closeModal}
        onSave={saveEntry}
        entry={entryToEdit}
        defaultCategory={defaultCategory}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

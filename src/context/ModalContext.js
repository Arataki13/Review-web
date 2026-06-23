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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to save entries.');

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
            poster_url: entryData.poster_url,
            description: entryData.description,
            external_id: entryData.external_id,
            external_rating: entryData.external_rating,
            user_id: user.id
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
              poster_url: entryData.poster_url,
              description: entryData.description,
              external_id: entryData.external_id,
              external_rating: entryData.external_rating,
              user_id: user.id
            },
          ]);

        if (error) throw error;
      }
      triggerRefresh();
      closeModal();
    } catch (err) {
      console.error('Error saving entry:', err.message);
      alert('Failed to save entry. ' + err.message);
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

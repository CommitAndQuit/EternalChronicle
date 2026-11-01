import React, { useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import AppShell from './components/journal/AppShell';
import Dashboard from './components/journal/Dashboard';
import JournalView from './components/journal/JournalView';
import useJournals from './hooks/useJournals';
import { createEmptyJournal, nextAccentColor } from './data/seedJournals';

const VIEW = {
  DASHBOARD: 'dashboard',
  JOURNAL: 'journal',
};

function App() {
  const {
    journals,
    ready,
    addJournal,
    updateJournal,
    deleteJournal,
    importJournals,
  } = useJournals();
  const [view, setView] = useState(VIEW.DASHBOARD);
  const [activeId, setActiveId] = useState(null);
  const [startEditing, setStartEditing] = useState(false);
  const scrollRef = useRef(null);

  const activeJournal = journals.find((journal) => journal.id === activeId) || null;

  const handleOpen = (journal) => {
    setActiveId(journal.id);
    setStartEditing(false);
    setView(VIEW.JOURNAL);
  };

  const handleAdd = () => {
    const journal = createEmptyJournal({
      accentColor: nextAccentColor(journals.length),
    });
    addJournal(journal);
    setActiveId(journal.id);
    setStartEditing(true);
    setView(VIEW.JOURNAL);
  };

  const handleSave = (journal) => {
    updateJournal(journal);
    setStartEditing(false);
  };

  const handleDelete = (journal) => {
    deleteJournal(journal.id);
    setActiveId(null);
    setStartEditing(false);
    setView(VIEW.DASHBOARD);
  };

  const handleBackToDashboard = () => {
    setView(VIEW.DASHBOARD);
    setActiveId(null);
    setStartEditing(false);
  };

  return (
    <AppShell>
      <LayoutGroup id="eternal-journals">
        <div className="relative h-full">
          {ready ? (
            <Dashboard
              journals={journals}
              onOpen={handleOpen}
              onAdd={handleAdd}
              onImport={importJournals}
              scrollRef={scrollRef}
            />
          ) : (
            <LoadingScreen />
          )}

          <AnimatePresence initial={false}>
            {view === VIEW.JOURNAL && activeJournal && (
              <JournalView
                key={`journal-${activeJournal.id}`}
                journal={activeJournal}
                startEditing={startEditing}
                onBack={handleBackToDashboard}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </AppShell>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#FAF9F8]">
      <motion.span
        className="h-9 w-9 rounded-full border-2 border-[#C2185B]/20 border-t-[#C2185B]"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      />
      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-black/35">
        Eternal Chronicle
      </p>
    </div>
  );
}

export default App;

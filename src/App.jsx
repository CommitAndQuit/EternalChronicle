import React, { useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import AppShell from './components/journal/AppShell';
import Dashboard from './components/journal/Dashboard';
import CoverEditor from './components/journal/CoverEditor';
import DetailView from './components/journal/DetailView';
import SuccessView from './components/journal/SuccessView';
import useJournals from './hooks/useJournals';
import { createEmptyJournal } from './data/seedJournals';

const VIEW = {
  DASHBOARD: 'dashboard',
  COVER: 'cover',
  DETAIL: 'detail',
  SUCCESS: 'success',
};

function App() {
  const {
    journals,
    ready,
    addJournal,
    updateJournal,
    publishJournal,
    deleteJournal,
    importJournals,
  } = useJournals();
  const [view, setView] = useState(VIEW.DASHBOARD);
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState('published');
  const scrollRef = useRef(null);

  const activeJournal = journals.find((journal) => journal.id === activeId) || null;

  const handleOpen = (journal) => {
    setActiveId(journal.id);
    if (journal.status === 'draft') {
      setTab('drafts');
      setView(VIEW.COVER);
    } else {
      setView(VIEW.DETAIL);
    }
  };

  const handleAdd = () => {
    const draft = createEmptyJournal();
    addJournal(draft);
    setActiveId(draft.id);
    setTab('drafts');
    setView(VIEW.COVER);
  };

  const handleSave = (journal) => {
    updateJournal(journal);
  };

  const handlePublish = (journal) => {
    const published = publishJournal(journal);
    setActiveId(published.id);
    setTab('published');
    setView(VIEW.SUCCESS);
    window.requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0 }));
  };

  const handleCardMenu = (journal) => {
    if (journal.status === 'draft') {
      handlePublish(journal);
    } else {
      setActiveId(journal.id);
      setView(VIEW.COVER);
    }
  };

  const handleDelete = (journal) => {
    deleteJournal(journal.id);
    setActiveId(null);
    setView(VIEW.DASHBOARD);
  };

  const handleRead = (journal) => {
    if (journal) {
      updateJournal(journal);
      setActiveId(journal.id);
    }
    setView(VIEW.DETAIL);
  };

  const handleBackToDashboard = () => {
    setView(VIEW.DASHBOARD);
    setActiveId(null);
  };

  const handleBackFromSuccess = () => {
    setView(VIEW.DASHBOARD);
    setActiveId(null);
    setTab('published');
  };

  return (
    <AppShell>
      <LayoutGroup id="eternal-journals">
        <div className="relative h-full">
          {ready ? (
            <Dashboard
              journals={journals}
              tab={tab}
              onTabChange={setTab}
              onOpen={handleOpen}
              onAdd={handleAdd}
              onPublish={handleCardMenu}
              onDelete={handleDelete}
              onImport={importJournals}
              scrollRef={scrollRef}
            />
          ) : (
            <LoadingScreen />
          )}

          <AnimatePresence initial={false}>
            {view === VIEW.COVER && activeJournal && (
              <CoverEditor
                key={`cover-${activeJournal.id}`}
                journal={activeJournal}
                onBack={handleBackToDashboard}
                onSave={handleSave}
                onPublish={handlePublish}
                onDelete={handleDelete}
                onRead={handleRead}
              />
            )}

            {view === VIEW.DETAIL && activeJournal && (
              <DetailView
                key={`detail-${activeJournal.id}`}
                journal={activeJournal}
                onBack={handleBackToDashboard}
                onEdit={(journal) => {
                  setActiveId(journal.id);
                  setView(VIEW.COVER);
                }}
                onDelete={handleDelete}
              />
            )}

            {view === VIEW.SUCCESS && activeJournal && (
              <SuccessView
                key={`success-${activeJournal.id}`}
                journal={activeJournal}
                onRead={() => handleRead(activeJournal)}
                onBack={handleBackFromSuccess}
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

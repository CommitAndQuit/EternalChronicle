import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Calendar, ChevronDown, PenLine } from 'lucide-react';
import AutoTextarea from './AutoTextarea';
import CategorySheet from './CategorySheet';
import ContentEditor from './ContentEditor';
import MoreMenu from './MoreMenu';
import { cardImage } from '../../lib/images';
import { categoryFor } from '../../data/seedJournals';
import { formatJournalDate, fromDateInputValue, toDateInputValue } from '../../lib/time';

export default function CoverEditor({
  journal,
  onBack,
  onSave,
  onPublish,
  onDelete,
  onRead,
}) {
  const reduceMotion = useReducedMotion();
  const dateRef = useRef(null);
  const [title, setTitle] = useState(journal.title || '');
  const [category, setCategory] = useState(journal.category || 'Daily Life');
  const [journalDate, setJournalDate] = useState(journal.journalDate || '');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const isDraft = journal.status === 'draft';
  const categoryMeta = categoryFor(category);

  useEffect(() => {
    setTitle(journal.title || '');
    setCategory(journal.category || 'Daily Life');
    setJournalDate(journal.journalDate || '');
  }, [journal.id, journal.title, journal.category, journal.journalDate]);

  useEffect(() => {
    if (!isDraft) return undefined;
    const timer = window.setTimeout(() => setSheetOpen(true), 460);
    return () => window.clearTimeout(timer);
  }, [isDraft, journal.id]);

  const buildJournal = () => ({
    ...journal,
    title,
    category,
    journalDate,
  });

  const openEditor = () => {
    setSheetOpen(false);
    setEditorOpen(true);
  };

  const handleBack = () => {
    if (sheetOpen) {
      setSheetOpen(false);
      return;
    }
    onSave(buildJournal());
    onBack();
  };

  const handleContentClose = (updated) => {
    onSave(updated);
    setEditorOpen(false);
    if (!isDraft) onRead?.(updated);
  };

  const handlePublish = (published) => {
    onPublish(published);
  };

  const handleOpenFromMenu = () => {
    if (isDraft) openEditor();
    else onRead?.(buildJournal());
  };

  const handleMenuPublish = () => {
    if (isDraft) {
      onPublish({ ...buildJournal(), status: 'published' });
    } else {
      openEditor();
    }
  };

  const handleDatePick = (event) => {
    setJournalDate(fromDateInputValue(event.target.value));
  };

  return (
    <motion.div
      className="absolute inset-0 z-30 overflow-hidden text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
    >
      <motion.div
        layoutId={`journal-card-${journal.id}`}
        className="absolute inset-0"
        style={{ backgroundColor: journal.accentColor }}
        transition={{ type: 'spring', stiffness: 360, damping: 35 }}
      />

      <motion.div
        className="relative mx-auto flex h-full w-full max-w-[1180px] flex-col md:px-10 lg:px-12"
        style={{ pointerEvents: editorOpen ? 'none' : 'auto' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: editorOpen ? 0 : 1 }}
        transition={{
          duration: reduceMotion ? 0 : 0.2,
          delay: reduceMotion || editorOpen ? 0 : 0.08,
        }}
      >
        <div className="flex h-[56px] shrink-0 items-center justify-between px-3 md:h-[76px] md:px-0">
          <button
            type="button"
            aria-label="Back to journals"
            onClick={handleBack}
            className="grid h-10 w-10 place-items-center rounded-full text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <ArrowLeft size={23} strokeWidth={2.1} />
          </button>
          <span className="text-[18px] font-medium tracking-[-0.015em] text-white/95 md:text-[20px]">
            {isDraft ? 'Create Journal' : 'Edit Journal'}
          </span>
          <MoreMenu
            journal={journal}
            tone="light"
            label="Cover options"
            onOpen={handleOpenFromMenu}
            onPublish={handleMenuPublish}
            onDelete={() => onDelete?.(journal)}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row md:items-stretch md:gap-10 lg:gap-16">
          <div className="shrink-0 px-6 pt-4 md:flex md:w-[46%] md:flex-col md:justify-center md:px-0 md:pt-0">
            <AutoTextarea
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give your journal a title"
              aria-label="Journal title"
              maxLength={120}
              className="w-full max-w-[82%] bg-transparent text-[38px] font-normal leading-[1.06] tracking-[-0.035em] text-white outline-none placeholder:text-white/35 md:max-w-none md:text-[52px] lg:text-[64px]"
            />

            <div className="mt-5 flex flex-wrap items-center gap-2 md:mt-7 md:gap-3">
              <button
                type="button"
                onClick={() => {
                  const input = dateRef.current;
                  if (!input) return;
                  if (typeof input.showPicker === 'function') {
                    try {
                      input.showPicker();
                    } catch {
                      input.click();
                    }
                  } else {
                    input.click();
                  }
                }}
                className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3.5 text-[13px] font-medium text-white/80 backdrop-blur-sm outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/70 md:h-11 md:gap-2 md:px-4 md:text-[14px]"
              >
                <Calendar size={15} strokeWidth={1.9} className="md:h-4 md:w-4" />
                {journalDate ? formatJournalDate(journalDate) : 'Add Date'}
              </button>
              <input
                ref={dateRef}
                type="date"
                value={toDateInputValue(journalDate)}
                onChange={handleDatePick}
                tabIndex={-1}
                aria-label="Journal date"
                className="pointer-events-none absolute h-0 w-0 opacity-0"
              />

              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 pl-1 pr-2.5 text-[13px] font-medium text-white/85 backdrop-blur-sm outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/70 md:h-11 md:pl-1.5 md:pr-3.5 md:text-[14px]"
              >
                <img
                  src={categoryMeta.icon}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover md:h-8 md:w-8"
                />
                {category}
                <ChevronDown size={14} strokeWidth={2} className="text-white/60" />
              </button>
            </div>

            <button
              type="button"
              onClick={openEditor}
              className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-white/75 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 md:mt-7 md:text-[15px]"
            >
              <PenLine size={15} strokeWidth={1.9} />
              {isDraft ? 'Edit Draft' : 'Edit Journal'}
            </button>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden md:flex md:items-end md:justify-center md:pb-10">
            <img
              src={cardImage(journal.illustration)}
              alt=""
              draggable="false"
              className="absolute bottom-[-1px] left-1/2 h-[302px] w-[104%] max-w-none -translate-x-1/2 select-none object-cover object-bottom md:static md:h-auto md:max-h-[64vh] md:w-auto md:max-w-full md:translate-x-0 md:object-contain md:object-bottom"
            />
          </div>
        </div>
      </motion.div>

      <CategorySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        category={category}
        onCategoryChange={setCategory}
        onContinue={openEditor}
      />

      <AnimatePresence>
        {editorOpen && (
          <ContentEditor
            key="content-editor"
            journal={buildJournal()}
            onClose={handleContentClose}
            onPublish={handlePublish}
            onDelete={onDelete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

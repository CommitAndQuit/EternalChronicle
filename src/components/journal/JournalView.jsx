import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Calendar, PenLine, Save, Sparkles, Trash2 } from 'lucide-react';
import AutoTextarea from './AutoTextarea';
import MediaGrid from './MediaGrid';
import MoreMenu from './MoreMenu';
import { cardImage, fileToCompressedDataUrl } from '../../lib/images';
import { formatJournalDate, fromDateInputValue, toDateInputValue } from '../../lib/time';
import { TITLE_MODEL, suggestTitles, titleFor } from '../../lib/title';

export default function JournalView({
  journal,
  startEditing = false,
  onBack,
  onSave,
  onDelete,
}) {
  const reduceMotion = useReducedMotion();
  const dateRef = useRef(null);
  const suggestRequest = useRef(0);
  const [editing, setEditing] = useState(startEditing);
  const [title, setTitle] = useState(journal.title || '');
  const [titleSource, setTitleSource] = useState(
    journal.titleSource || (journal.title ? 'user' : 'auto'),
  );
  const [generatedFrom, setGeneratedFrom] = useState(
    journal.titleSource === 'auto' && journal.title ? journal.content || '' : null,
  );
  const [suggestions, setSuggestions] = useState([]);
  const [suggesting, setSuggesting] = useState(false);
  const [content, setContent] = useState(journal.content || '');
  const [journalDate, setJournalDate] = useState(journal.journalDate || '');
  const [photos, setPhotos] = useState(journal.photos || []);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setEditing(startEditing);
    setTitle(journal.title || '');
    setTitleSource(journal.titleSource || (journal.title ? 'user' : 'auto'));
    setGeneratedFrom(
      journal.titleSource === 'auto' && journal.title ? journal.content || '' : null,
    );
    setSuggestions([]);
    setSuggesting(false);
    setContent(journal.content || '');
    setJournalDate(journal.journalDate || '');
    setPhotos(journal.photos || []);
  }, [journal.id, journal.title, journal.titleSource, journal.content, journal.journalDate, journal.photos, startEditing]);

  const resolveTitle = () => {
    const trimmed = title.trim();

    if (titleSource === 'user' && trimmed) {
      return {
        title: trimmed,
        titleSource: 'user',
        titleModel: journal.titleModel || null,
        generatedFrom,
      };
    }

    const needsGeneration = !trimmed || generatedFrom === null || content !== generatedFrom;
    if (!needsGeneration) {
      return {
        title: trimmed,
        titleSource: 'auto',
        titleModel: journal.titleModel || TITLE_MODEL,
        generatedFrom,
      };
    }

    return {
      title: titleFor({ content, journalDate, category: journal.category }),
      titleSource: 'auto',
      titleModel: TITLE_MODEL,
      generatedFrom: content,
    };
  };

  const buildJournal = () => {
    const resolved = resolveTitle();
    setTitle(resolved.title);
    setTitleSource(resolved.titleSource);
    setGeneratedFrom(resolved.generatedFrom);
    setSuggestions([]);

    return {
      ...journal,
      title: resolved.title,
      titleSource: resolved.titleSource,
      titleModel: resolved.titleModel,
      content,
      journalDate,
      photos,
    };
  };

  const handleTitleChange = (event) => {
    const value = event.target.value;
    setTitle(value);
    setTitleSource(value.trim() ? 'user' : 'auto');
    setGeneratedFrom(value.trim() ? null : generatedFrom);
    setSuggestions([]);
  };

  const handleSuggest = async () => {
    const requestId = suggestRequest.current + 1;
    suggestRequest.current = requestId;
    setSuggesting(true);
    try {
      const result = await suggestTitles(
        { content, journalDate, category: journal.category },
        { count: 3 },
      );
      if (requestId !== suggestRequest.current) return;
      setSuggestions(result.titles);
      if (result.titles[0]) {
        setTitle(result.titles[0]);
        setTitleSource('auto');
        setGeneratedFrom(content);
      }
    } finally {
      if (requestId === suggestRequest.current) setSuggesting(false);
    }
  };

  const chooseSuggestion = (value) => {
    setTitle(value);
    setTitleSource('user');
    setGeneratedFrom(null);
    setSuggestions([]);
  };

  const handleSave = () => {
    onSave(buildJournal());
    setEditing(false);
  };

  const handleBack = () => {
    if (editing) onSave(buildJournal());
    onBack();
  };

  const addPhotos = async (files) => {
    setAdding(true);
    try {
      const urls = await Promise.all(files.map((file) => fileToCompressedDataUrl(file)));
      setPhotos((current) => [...current, ...urls]);
    } catch (photoError) {
      console.error('Could not add photo:', photoError);
    } finally {
      setAdding(false);
    }
  };

  const openDatePicker = () => {
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
  };

  const menuActions = editing
    ? [
        {
          label: 'Save journal',
          icon: Save,
          onClick: handleSave,
        },
        {
          label: 'Delete journal',
          icon: Trash2,
          destructive: true,
          confirm: true,
          confirmTitle: 'Delete this journal?',
          onClick: () => onDelete?.(buildJournal()),
        },
      ]
    : [
        {
          label: 'Edit journal',
          icon: PenLine,
          onClick: () => setEditing(true),
        },
        {
          label: 'Delete journal',
          icon: Trash2,
          destructive: true,
          confirm: true,
          confirmTitle: 'Delete this journal?',
          onClick: () => onDelete?.(journal),
        },
      ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
      className="absolute inset-0 z-30 overflow-y-auto overscroll-contain text-white"
      style={{ backgroundColor: journal.accentColor }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20"
      />

      <div className="relative mx-auto flex min-h-full w-full max-w-[1180px] flex-col md:px-10 lg:px-12">
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
            {editing ? 'Edit Journal' : 'Journal'}
          </span>
          <MoreMenu
            journal={journal}
            tone="light"
            label="Journal options"
            actions={menuActions}
          />
        </div>

        <div className="flex flex-1 flex-col gap-8 px-6 pb-16 pt-4 md:flex-row md:items-start md:gap-10 md:px-0 md:pb-20 lg:gap-16">
          <div className="min-w-0 flex-1">
            {editing ? (
              <>
                <AutoTextarea
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Title (optional)"
                  aria-label="Journal title"
                  maxLength={120}
                  className="w-full bg-transparent text-[38px] font-normal leading-[1.06] tracking-[-0.035em] text-white outline-none placeholder:text-white/35 md:text-[52px] lg:text-[60px]"
                />
                {!title.trim() && (
                  <p className="mt-2 text-[12px] text-white/45">
                    Leave it blank and we&apos;ll name it when you save.
                  </p>
                )}
                {(suggesting || suggestions.length > 0) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {suggesting ? (
                      <span className="text-[12px] font-medium text-white/55">
                        Finding a title…
                      </span>
                    ) : (
                      suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          aria-label={`Use title: ${suggestion}`}
                          onClick={() => chooseSuggestion(suggestion)}
                          className="max-w-full truncate rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white/80 backdrop-blur-sm outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                          {suggestion}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <h1 className="text-[38px] font-normal leading-[1.06] tracking-[-0.035em] text-white md:text-[52px] lg:text-[60px]">
                {journal.title || 'Untitled journal'}
              </h1>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-7">
              {editing ? (
                <button
                  type="button"
                  onClick={openDatePicker}
                  className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3.5 text-[13px] font-medium text-white/80 backdrop-blur-sm outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/70 md:h-11 md:gap-2 md:px-4 md:text-[14px]"
                >
                  <Calendar size={15} strokeWidth={1.9} className="md:h-4 md:w-4" />
                  {journalDate ? formatJournalDate(journalDate) : 'Add Date'}
                </button>
              ) : (
                journalDate && (
                  <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3.5 text-[13px] font-medium text-white/80 backdrop-blur-sm md:h-11 md:gap-2 md:px-4 md:text-[14px]">
                    <Calendar size={15} strokeWidth={1.9} className="md:h-4 md:w-4" />
                    {formatJournalDate(journalDate)}
                  </span>
                )
              )}

              <input
                ref={dateRef}
                type="date"
                value={toDateInputValue(journalDate)}
                onChange={(event) => setJournalDate(fromDateInputValue(event.target.value))}
                tabIndex={-1}
                aria-label="Journal date"
                className="pointer-events-none absolute h-0 w-0 opacity-0"
              />

              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={handleSuggest}
                    disabled={suggesting}
                    aria-label="Suggest a title"
                    className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-4 text-[13px] font-medium text-white/85 backdrop-blur-sm outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-60 md:h-11 md:text-[14px]"
                  >
                    <Sparkles size={15} strokeWidth={1.9} className={suggesting ? 'animate-pulse' : ''} />
                    {suggesting ? 'Naming…' : 'Suggest'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-[#1A171A] shadow-[0_8px_20px_rgba(20,12,20,0.18)] outline-none transition-transform hover:scale-[1.03] active:scale-95 focus-visible:ring-2 focus-visible:ring-white md:h-11 md:px-5 md:text-[14px]"
                  >
                    <Save size={15} strokeWidth={2} />
                    Save
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-4 text-[13px] font-medium text-white/85 backdrop-blur-sm outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/70 md:h-11 md:text-[14px]"
                >
                  <PenLine size={15} strokeWidth={1.9} />
                  Edit Journal
                </button>
              )}
            </div>

            <div className="mt-6 md:mt-8">
              {editing ? (
                <AutoTextarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write your story..."
                  aria-label="Journal body"
                  className="min-h-[180px] w-full bg-transparent text-[17px] font-normal leading-[1.6] tracking-[-0.012em] text-white/90 outline-none placeholder:text-white/35 md:min-h-[220px] md:text-[18px]"
                />
              ) : (
                <div className="whitespace-pre-line text-[17px] leading-[1.65] tracking-[-0.012em] text-white/85 md:text-[18px]">
                  {journal.content || 'No words yet — just a moment worth keeping.'}
                </div>
              )}
            </div>

            <MediaGrid
              className="mt-7 md:mt-9"
              photos={photos}
              editable={editing}
              onRemove={(index) =>
                setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
              }
              onAdd={addPhotos}
            />
            {adding && <p className="mt-2 text-[12px] text-white/60">Adding photo…</p>}
          </div>

          <div className="relative shrink-0 md:sticky md:top-8 md:w-[38%]">
            <img
              src={cardImage(journal.illustration)}
              alt=""
              draggable="false"
              className="mx-auto w-full max-w-[420px] select-none object-contain drop-shadow-[0_24px_45px_rgba(20,12,20,0.28)]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

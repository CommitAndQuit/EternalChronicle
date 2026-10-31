import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AutoTextarea from './AutoTextarea';
import MediaGrid from './MediaGrid';
import MoreMenu from './MoreMenu';
import { CATEGORIES } from '../../data/seedJournals';
import { fileToCompressedDataUrl } from '../../lib/images';

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ContentEditor({ journal, onClose, onPublish, onDelete }) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef(null);
  const previousFocus = useRef(null);
  const [title, setTitle] = useState(journal.title || '');
  const [content, setContent] = useState(journal.content || '');
  const [category, setCategory] = useState(journal.category || 'Daily Life');
  const [photos, setPhotos] = useState(journal.photos || []);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const isDraft = journal.status === 'draft';
  const actionLabel = isDraft ? 'Publish' : 'Save';

  const updated = useMemo(
    () => ({
      ...journal,
      title,
      content,
      category,
      photos,
      status: journal.status,
    }),
    [journal, title, content, category, photos],
  );

  useEffect(() => {
    previousFocus.current = document.activeElement;
    const timer = window.setTimeout(() => panelRef.current?.focus(), 90);
    return () => {
      window.clearTimeout(timer);
      previousFocus.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose(updated);
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, updated]);

  const handleAction = () => {
    if (isDraft) {
      if (!title.trim()) {
        setError('Give your journal a title before publishing.');
        panelRef.current?.querySelector('textarea')?.focus();
        return;
      }
      setError('');
      onPublish({ ...updated, status: 'published' });
    } else {
      onClose(updated);
    }
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

  return (
    <div className="absolute inset-0 z-40 md:flex md:items-center md:justify-center md:bg-[#171017]/35">
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={isDraft ? 'Edit draft' : 'Edit journal'}
        tabIndex={-1}
        initial={{ y: reduceMotion ? 24 : 64, opacity: reduceMotion ? 0 : 0.7 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: reduceMotion ? 24 : 70, opacity: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.16 }
            : { type: 'spring', stiffness: 360, damping: 38, mass: 0.92 }
        }
        className="absolute inset-x-0 bottom-0 top-[44px] flex flex-col overflow-hidden rounded-t-[28px] bg-[#FCFCFA] shadow-[0_-24px_70px_rgba(24,12,22,0.28)] outline-none md:relative md:inset-auto md:h-[88dvh] md:max-h-[760px] md:w-[560px] md:max-w-[calc(100%_-_3rem)] md:rounded-[28px]"
      >
        <div className="flex h-[62px] shrink-0 items-center justify-between px-4 md:h-[70px] md:px-6">
          <button
            type="button"
            aria-label="Close editor"
            onClick={() => onClose(updated)}
            className="grid h-10 w-10 place-items-center rounded-full text-[#252125] outline-none transition-colors hover:bg-black/[0.055] focus-visible:ring-2 focus-visible:ring-[#C2185B]"
          >
            <ArrowLeft size={23} strokeWidth={2.1} />
          </button>
          <h2 className="text-[19px] font-medium tracking-[-0.02em] text-[#1A171A] md:text-[21px]">
            {isDraft ? 'Create Journal' : 'Edit Journal'}
          </h2>
          <MoreMenu
            journal={journal}
            tone="ink"
            label="Editor options"
            onOpen={() => onClose(updated)}
            onPublish={handleAction}
            onDelete={() => onDelete?.(journal)}
          />
        </div>
        <div className="h-px shrink-0 bg-black/[0.065]" />
  
        <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-6 pb-14 pt-6 md:px-10 md:pb-16">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/35">
              {isDraft ? 'DRAFTS' : 'PUBLISHED'}
            </span>
            <button
              type="button"
              onClick={handleAction}
              className="h-[44px] rounded-full bg-[#C2185B] px-5 text-[16px] font-medium tracking-[-0.01em] text-white shadow-[0_8px_20px_rgba(194,24,91,0.22)] outline-none transition-transform active:scale-[0.965] focus-visible:ring-4 focus-visible:ring-[#C2185B]/25"
            >
              {actionLabel}
            </button>
          </div>
  
          {error && (
            <p className="mt-3 rounded-xl bg-[#FCE8F0] px-3 py-2 text-[13px] text-[#A3144B]" role="alert">
              {error}
            </p>
          )}
  
          <AutoTextarea
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (error) setError('');
            }}
            placeholder="Title"
            aria-label="Journal title"
            maxLength={120}
            className="mt-5 w-full bg-transparent text-[38px] font-normal leading-[1.12] tracking-[-0.035em] text-[#0B0B0B] outline-none placeholder:text-black/20 md:mt-6 md:text-[44px]"
          />
  
          <AutoTextarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your story..."
            aria-label="Journal body"
            className="mt-4 min-h-[132px] w-full bg-transparent text-[17px] font-normal leading-[1.53] tracking-[-0.012em] text-[#6B666B] outline-none placeholder:text-black/25 md:min-h-[150px] md:text-[18px]"
          />
  
          <MediaGrid
            className="mt-7"
            photos={photos}
            editable
            onRemove={(index) => setPhotos((current) => current.filter((_, i) => i !== index))}
            onAdd={addPhotos}
          />
          {adding && <p className="mt-2 text-[12px] text-black/40">Adding photo…</p>}
  
          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/35">
              Category
            </p>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
              {CATEGORIES.map((item) => {
                const selected = item.label === category;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCategory(item.label)}
                    className={`flex h-[42px] shrink-0 items-center gap-2 rounded-full border pl-1.5 pr-3.5 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C2185B] ${
                      selected
                        ? 'border-[#E58A69] bg-[#FBE6DB] text-[#332B2C]'
                        : 'border-transparent bg-[#F2F0F0] text-[#777177]'
                    }`}
                  >
                    <img src={item.icon} alt="" className="h-7 w-7 rounded-full object-cover" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-8 text-center text-[12px] leading-relaxed text-black/35">
            Your journal is completely private and saved only on your device.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

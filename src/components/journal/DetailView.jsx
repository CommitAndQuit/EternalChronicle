import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, PenLine, Trash2 } from 'lucide-react';
import MediaGrid from './MediaGrid';
import MoreMenu from './MoreMenu';
import { cardImage } from '../../lib/images';
import { categoryFor } from '../../data/seedJournals';
import { formatJournalDate, relativeTime } from '../../lib/time';

export default function DetailView({ journal, onBack, onEdit, onDelete }) {
  const reduceMotion = useReducedMotion();
  const category = categoryFor(journal.category);

  return (
    <motion.div
      initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 0.8, 0.3, 1] }}
      className="absolute inset-0 z-30 overflow-y-auto overscroll-contain bg-[#FAF9F8] text-[#0B0B0B]"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex h-[56px] items-center justify-between px-3 md:h-[72px] md:px-6">
          <button
            type="button"
            aria-label="Back to journals"
            onClick={onBack}
            className="grid h-10 w-10 place-items-center rounded-full outline-none transition-colors hover:bg-black/[0.055] focus-visible:ring-2 focus-visible:ring-[#C2185B]"
          >
            <ArrowLeft size={23} strokeWidth={2.1} />
          </button>
          <span className="text-[17px] font-medium tracking-[-0.01em] md:text-[18px]">Journal</span>
          <MoreMenu
            journal={journal}
            tone="ink"
            label="Journal options"
            actions={[
              {
                label: 'Edit journal',
                icon: PenLine,
                onClick: () => onEdit(journal),
              },
              {
                label: 'Delete journal',
                icon: Trash2,
                destructive: true,
                confirm: true,
                confirmTitle: 'Delete this journal?',
                onClick: () => onDelete(journal),
              },
            ]}
          />
        </div>

        <article className="px-5 pb-16 md:px-8 md:pb-24 lg:px-10">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-black/40 md:text-[12px]">
            <img
              src={category.icon}
              alt=""
              className="h-[18px] w-[18px] rounded-full object-cover md:h-5 md:w-5"
            />
            <span>{journal.category}</span>
            <span className="text-black/20">·</span>
            <span>{relativeTime(journal.publishedAt || journal.updatedAt || journal.createdAt)}</span>
          </div>

          <h1 className="mt-3 text-[34px] font-normal leading-[1.08] tracking-[-0.04em] md:mt-4 md:text-[52px] lg:text-[60px]">
            {journal.title || 'Untitled journal'}
          </h1>
          {journal.journalDate && (
            <p className="mt-2 text-[13px] text-black/40 md:text-[14px]">
              {formatJournalDate(journal.journalDate)}
            </p>
          )}

          <div
            className="relative mt-6 aspect-[1.27] overflow-hidden rounded-[22px] md:mt-8 md:aspect-[16/9] md:rounded-[28px]"
            style={{ backgroundColor: journal.accentColor }}
          >
            <img
              src={cardImage(journal.illustration)}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-6 whitespace-pre-line text-[17px] leading-[1.57] tracking-[-0.012em] text-[#4E484E] md:mt-8 md:text-[19px] md:leading-[1.65]">
            {journal.content || 'No words yet — just a moment worth keeping.'}
          </div>

          <MediaGrid photos={journal.photos} className="mt-7 md:mt-10" />
        </article>
      </div>
    </motion.div>
  );
}

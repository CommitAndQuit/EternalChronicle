import React from 'react';
import { motion } from 'framer-motion';
import { cardImage } from '../../lib/images';
import { relativeTime } from '../../lib/time';
import MoreMenu from './MoreMenu';

export default function JournalCard({ journal, onOpen, onPublish, onDelete }) {
  const time = relativeTime(journal.publishedAt || journal.updatedAt || journal.createdAt);

  return (
    <motion.article
      layoutId={`journal-card-${journal.id}`}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
      style={{ backgroundColor: journal.accentColor }}
      className="group relative aspect-[1.27] w-full overflow-hidden rounded-[22px] shadow-[0_10px_24px_rgba(30,18,28,0.10)]"
    >
      <img
        src={cardImage(journal.illustration)}
        alt=""
        draggable="false"
        loading="lazy"
        className="absolute inset-0 h-full w-full select-none object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/[0.045] to-transparent" />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-[18px] md:p-5 lg:p-6">
        <h3 className="max-w-[50%] text-[26px] font-normal leading-[1.06] tracking-[-0.03em] text-white md:max-w-[62%] md:text-[28px] lg:text-[30px]">
          {journal.title || 'Untitled journal'}
        </h3>
        <p className="text-[14px] font-normal tracking-[-0.01em] text-white/55 md:text-[15px]">{time}</p>
      </div>

      <button
        type="button"
        aria-label={`Open ${journal.title || 'untitled journal'}`}
        onClick={() => onOpen(journal)}
        className="absolute inset-0 z-10 rounded-[22px] outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white/80"
      />

      <div className="absolute right-2.5 top-2.5 z-20">
        <MoreMenu
          journal={journal}
          onOpen={() => onOpen(journal)}
          onPublish={() => onPublish(journal)}
          onDelete={() => onDelete(journal)}
        />
      </div>
    </motion.article>
  );
}

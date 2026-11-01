import React from 'react';
import { motion } from 'framer-motion';
import { cardImage, resolvePhoto } from '../../lib/images';
import { relativeTime } from '../../lib/time';

const STACK_LAYOUT = [
  { rotate: -5, x: 0, y: 0 },
  { rotate: 5, x: 7, y: 4 },
  { rotate: -12, x: -7, y: 8 },
];

function PhotoStack({ photos }) {
  return (
    <div className="pointer-events-none absolute bottom-[9%] right-[5%] top-[24%] w-[47%]">
      {photos.map((photo, index) => {
        const layout = STACK_LAYOUT[Math.min(index, STACK_LAYOUT.length - 1)];
        return (
          <div
            key={`${photo}-${index}`}
            className="absolute inset-0 rounded-[11px] border-[3px] border-white bg-white pb-[9%] shadow-[0_16px_32px_rgba(25,15,25,0.3)]"
            style={{
              transform: `rotate(${layout.rotate}deg) translate(${layout.x}%, ${layout.y}%)`,
              zIndex: photos.length - index,
            }}
          >
            <img
              src={photo}
              alt=""
              draggable="false"
              loading="lazy"
              className="h-full w-full select-none rounded-[6px] object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}

export default function JournalCard({ journal, onOpen }) {
  const time = relativeTime(journal.publishedAt || journal.updatedAt || journal.createdAt);
  const photos = (journal.photos || [])
    .map(resolvePhoto)
    .filter(Boolean)
    .slice(0, 3);
  const hasPhotos = photos.length > 0;

  return (
    <motion.article
      layoutId={`journal-card-${journal.id}`}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
      style={{ backgroundColor: journal.accentColor }}
      className="group relative aspect-[1.27] w-full overflow-hidden rounded-[22px] shadow-[0_10px_24px_rgba(30,18,28,0.10)]"
    >
      {hasPhotos ? (
        <PhotoStack photos={photos} />
      ) : (
        <img
          src={cardImage(journal.illustration)}
          alt=""
          draggable="false"
          loading="lazy"
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/[0.045] to-transparent" />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-[18px] md:p-5 lg:p-6">
        <h3
          className={`text-[26px] font-normal leading-[1.06] tracking-[-0.03em] text-white [text-shadow:0_1px_10px_rgba(20,12,20,0.24)] md:text-[28px] lg:text-[30px] ${
            hasPhotos ? 'max-w-[46%]' : 'max-w-[50%] md:max-w-[62%]'
          }`}
        >
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
    </motion.article>
  );
}

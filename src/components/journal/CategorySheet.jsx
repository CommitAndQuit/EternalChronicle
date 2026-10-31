import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CATEGORIES } from '../../data/seedJournals';

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function CategorySheet({
  open,
  onClose,
  category,
  onCategoryChange,
  onContinue,
}) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 70);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
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
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50 md:flex md:items-center md:justify-center md:p-6">
          <motion.button
            type="button"
            aria-label="Close category picker"
            className="absolute inset-0 h-full w-full cursor-default bg-[#170F16]/38"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.section
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-sheet-title"
            tabIndex={-1}
            initial={{ y: reduceMotion ? 0 : '104%', opacity: reduceMotion ? 0 : 0.75 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduceMotion ? 0 : '104%', opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { type: 'spring', stiffness: 330, damping: 34, mass: 0.9 }
            }
            className="absolute inset-x-3 bottom-3 rounded-[28px] bg-white px-5 pb-5 pt-6 shadow-[0_30px_80px_rgba(20,10,18,0.35)] outline-none md:relative md:inset-auto md:w-full md:max-w-[460px] md:px-7 md:pb-7 md:pt-8"
          >
            <h2
              id="category-sheet-title"
              className="text-[20px] font-semibold leading-none tracking-[-0.025em] text-[#191519] md:text-[22px]"
            >
              Choose Category
            </h2>

            <div className="mt-5 flex items-start justify-between gap-1">
              {CATEGORIES.map((item) => {
                const selected = item.label === category;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onCategoryChange(item.label)}
                    className="group flex min-w-0 flex-1 flex-col items-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B] focus-visible:ring-offset-2"
                  >
                    <span
                      className="grid h-[64px] w-[64px] place-items-center rounded-full transition-[border-color,padding] duration-200 md:h-[72px] md:w-[72px]"
                      style={{
                        border: `1.5px solid ${selected ? item.ring : 'transparent'}`,
                        padding: selected ? 4 : 0,
                        backgroundColor: selected ? '#FFFFFF' : 'transparent',
                      }}
                    >
                      <img
                        src={item.icon}
                        alt=""
                        draggable="false"
                        className="h-full w-full rounded-full object-cover"
                      />
                    </span>
                    <span
                      className={`mt-2 max-w-full truncate text-[12.5px] leading-none tracking-[-0.01em] md:text-[13px] ${
                        selected ? 'font-medium text-[#1C191C]' : 'font-normal text-[#858085]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onContinue}
              className="mt-6 h-[54px] w-full rounded-full bg-[#C2185B] text-[17px] font-medium tracking-[-0.01em] text-white shadow-[0_10px_24px_rgba(194,24,91,0.25)] outline-none transition-transform active:scale-[0.985] focus-visible:ring-4 focus-visible:ring-[#C2185B]/25 md:mt-7 md:h-[56px]"
            >
              Edit Draft
            </button>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}

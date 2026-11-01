import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus, ShieldCheck, Sparkles } from 'lucide-react';
import JournalCard from './JournalCard';
import LocalDataModal from './LocalDataModal';

const byRecent = (a, b) =>
  new Date(b.publishedAt || b.updatedAt || b.createdAt) -
  new Date(a.publishedAt || a.updatedAt || a.createdAt);

export default function Dashboard({
  journals,
  onOpen,
  onAdd,
  onImport,
  scrollRef,
}) {
  const [localDataOpen, setLocalDataOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const items = [...journals].sort(byRecent);

  return (
    <div className="flex h-full flex-col bg-[#FAF9F8] text-[#0B0B0B]">
      <div
        ref={scrollRef}
        className="no-scrollbar flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="app-container">
          <header className="flex items-end justify-between pb-5 pt-5 md:pb-9 md:pt-10">
            <div>
              <h1 className="text-[34px] font-normal leading-none tracking-[-0.045em] md:text-[56px] lg:text-[68px]">
                Eternal Chronicle
              </h1>
              <div className="mt-2 flex items-center gap-2 md:mt-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/35 md:text-[12px] md:tracking-[0.22em]">
                  {journals.length} {journals.length === 1 ? 'journal' : 'journals'}
                </p>
                <span className="text-black/20">·</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5E3474]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Local & Private
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setLocalDataOpen(true)}
                aria-label="Local data and backup"
                title="Local data & backup"
                className="mb-0.5 grid h-[46px] w-[46px] place-items-center rounded-full border border-black/[0.08] bg-white text-[#5E3474] shadow-[0_4px_14px_rgba(20,12,20,0.06)] outline-none transition-transform hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-[#5E3474] active:scale-95 md:h-[54px] md:w-[54px]"
              >
                <ShieldCheck size={22} strokeWidth={2.1} className="md:h-6 md:w-6" />
              </button>
              <button
                type="button"
                onClick={onAdd}
                aria-label="Create a journal"
                className="mb-0.5 grid h-[54px] w-[54px] place-items-center rounded-full bg-[#C2185B] text-white shadow-[0_12px_26px_rgba(194,24,91,0.33)] outline-none transition-transform duration-200 hover:scale-[1.04] focus-visible:ring-4 focus-visible:ring-[#C2185B]/25 active:scale-95 md:h-[68px] md:w-[68px]"
              >
                <Plus size={26} strokeWidth={2.1} className="md:h-8 md:w-8" />
              </button>
            </div>
          </header>

          <div className="pb-28 pt-1 md:pb-32 md:pt-2">
            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
              className="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-6 xl:grid-cols-3"
            >
              {items.map((journal) => (
                <JournalCard
                  key={journal.id}
                  journal={journal}
                  onOpen={onOpen}
                />
              ))}

              {items.length === 0 && <EmptyState onAdd={onAdd} />}
            </motion.div>
          </div>
        </div>
      </div>

      <LocalDataModal
        open={localDataOpen}
        onClose={() => setLocalDataOpen(false)}
        journals={journals}
        onImport={onImport}
      />
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center rounded-[24px] border border-dashed border-black/10 px-7 py-14 text-center md:col-span-2 md:py-20 xl:col-span-3">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#F3E8ED] text-[#C2185B] md:h-14 md:w-14">
        <Sparkles size={21} strokeWidth={1.8} className="md:h-6 md:w-6" />
      </span>
      <p className="mt-4 text-[18px] font-medium tracking-[-0.02em] text-[#1C191C] md:text-[22px]">
        No journals yet
      </p>
      <p className="mt-1.5 max-w-[230px] text-[14px] leading-relaxed text-black/45 md:max-w-[320px] md:text-[15px]">
        Your saved stories will live here. Start with a small moment.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 h-11 rounded-full bg-[#C2185B] px-5 text-[14px] font-medium text-white md:h-12 md:px-6 md:text-[15px]"
      >
        Create a journal
      </button>
    </div>
  );
}

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const spring = { type: 'spring', stiffness: 480, damping: 38, mass: 0.8 };

export default function FilterTabs({ value, onChange, draftCount }) {
  const reduceMotion = useReducedMotion();

  const options = [
    { id: 'published', label: 'Published' },
    { id: 'drafts', label: `Drafts${draftCount > 0 ? ` (${draftCount})` : ''}` },
  ];

  return (
    <div className="flex items-center gap-2" role="tablist" aria-label="Journal filters">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className={`relative flex min-h-[42px] items-center justify-center rounded-full px-4 text-[14px] font-medium tracking-[-0.01em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#C2185B] focus-visible:ring-offset-2 ${
              selected ? 'text-white' : 'bg-[#F1F1F1] text-[#262326] hover:bg-[#EAEAEA]'
            }`}
          >
            {selected && (
              <motion.span
                layoutId="journal-tab-pill"
                className="absolute inset-0 rounded-full bg-[#111111]"
                transition={reduceMotion ? { duration: 0 } : spring}
              />
            )}
            <span className="relative z-10 whitespace-nowrap">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { successCyclist } from '../../lib/images';

export default function SuccessView({ journal, onRead, onBack }) {
  const reduceMotion = useReducedMotion();
  const fade = (delay) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : delay, ease: [0.22, 0.8, 0.3, 1] },
  });

  return (
    <motion.div
      className="absolute inset-0 z-40 overflow-y-auto overscroll-contain bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
      role="status"
      aria-label="Journal published"
    >
      <div className="relative min-h-full">
        <div className="relative h-[320px] overflow-visible bg-[#5E3474] md:h-[440px] lg:h-[480px]">
          <motion.div
            layoutId={`journal-card-${journal.id}`}
            className="absolute inset-0 bg-[#5E3474]"
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          />
          <div className="relative z-10">
            <motion.h1
              {...fade(0.08)}
              className="px-8 pt-14 text-center text-[40px] font-normal leading-[1.07] tracking-[-0.045em] text-white md:pt-16 md:text-[56px] lg:text-[64px]"
            >
              Journal
              <br />
              Published
            </motion.h1>
          </div>

          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[166px] h-[96px] w-[96px] -translate-x-1/2 rounded-full border border-white/[0.14] bg-white/[0.055] md:top-[246px] md:h-[120px] md:w-[120px]"
          />
        </div>

        <motion.img
          src={successCyclist}
          alt=""
          draggable="false"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.97, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          transition={{
            duration: reduceMotion ? 0 : 0.55,
            delay: reduceMotion ? 0 : 0.16,
            ease: [0.22, 0.8, 0.3, 1],
          }}
          className="pointer-events-none absolute left-1/2 top-[229px] z-20 w-[200px] max-w-none select-none md:top-[316px] md:w-[280px] lg:top-[330px] lg:w-[300px]"
        />

        <div className="relative z-10 bg-white px-8 pb-10 pt-[88px] text-center md:pb-16 md:pt-[140px] lg:pt-[160px]">
          <motion.p
            {...fade(0.3)}
            className="mx-auto max-w-[298px] text-[16.5px] font-normal leading-[1.5] tracking-[-0.012em] text-[#6E686E] md:max-w-[420px] md:text-[18px]"
          >
            Your journal entry is safely saved in your private collection — a personal memory
            preserved just for you.
          </motion.p>

          <motion.button
            {...fade(0.4)}
            type="button"
            onClick={onRead}
            className="mt-7 h-[56px] w-full rounded-full bg-[#C2185B] text-[17px] font-medium tracking-[-0.01em] text-white shadow-[0_12px_28px_rgba(194,24,91,0.24)] outline-none transition-transform active:scale-[0.985] focus-visible:ring-4 focus-visible:ring-[#C2185B]/25 md:mx-auto md:mt-9 md:block md:max-w-[380px] md:h-[58px]"
          >
            Read the Journal
          </motion.button>

          <motion.button
            {...fade(0.48)}
            type="button"
            onClick={onBack}
            className="mt-2 inline-flex min-h-[44px] items-center px-4 text-[16px] font-medium tracking-[-0.01em] text-[#C2185B] outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B]/40"
          >
            Back to Journal list
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

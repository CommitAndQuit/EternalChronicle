import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BookOpen, MoreHorizontal, PenLine, Send, Trash2 } from 'lucide-react';

const MENU_WIDTH = 208;

export default function MoreMenu({
  journal,
  onOpen,
  onPublish,
  onDelete,
  actions,
  tone = 'dark',
  className = '',
  label = 'Journal options',
}) {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, below: true });
  const reduceMotion = useReducedMotion();

  const close = (restoreFocus = false) => {
    setOpen(false);
    setConfirming(false);
    setPendingAction(null);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const estimatedHeight = 172;
    const below = rect.bottom + estimatedHeight + 12 < window.innerHeight;
    setCoords({
      top: below ? rect.bottom + 8 : Math.max(8, rect.top - estimatedHeight - 8),
      left: Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)),
      below,
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const focusTimer = window.setTimeout(() => {
      menuRef.current?.querySelector('button')?.focus();
    }, 40);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const choose = (action) => {
    close();
    action?.();
  };

  const isDraft = journal?.status === 'draft';
  const triggerTone =
    tone === 'light'
      ? 'text-white/90 hover:bg-white/10'
      : tone === 'ink'
        ? 'text-[#2A252A] hover:bg-black/[0.06]'
        : 'text-white hover:bg-black/10';
  const focusRing =
    tone === 'ink' ? 'focus-visible:ring-[#C2185B]/35' : 'focus-visible:ring-white/80';
  const customActions = Array.isArray(actions) && actions.length > 0;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          if (open) close();
          else openMenu();
        }}
        className={`grid h-9 w-9 place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 ${focusRing} ${triggerTone} ${className}`}
      >
        <MoreHorizontal size={22} strokeWidth={2.4} />
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  key="backdrop"
                  className="fixed inset-0 z-[70]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onMouseDown={() => close()}
                />
                <motion.div
                  ref={menuRef}
                  key="menu"
                  role="menu"
                  aria-label={label}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : coords.below ? -4 : 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  style={{
                    top: coords.top,
                    left: coords.left,
                    width: MENU_WIDTH,
                    transformOrigin: coords.below ? 'top right' : 'bottom right',
                  }}
                  className="fixed z-[80] overflow-hidden rounded-[20px] border border-black/[0.06] bg-white p-1.5 shadow-[0_22px_55px_rgba(20,12,20,0.24)]"
                >
                  {confirming ? (
                    <div className="p-2.5">
                      <p className="text-[14px] font-medium leading-snug text-[#1C191C]">
                        {pendingAction?.confirmTitle || 'Delete this journal?'}
                      </p>
                      <p className="mt-1 text-[12px] leading-snug text-black/45">
                        This can’t be undone.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirming(false);
                            setPendingAction(null);
                          }}
                          className="h-9 flex-1 rounded-full bg-[#F1F1F1] text-[13px] font-medium text-[#282428]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => choose(pendingAction?.onClick || onDelete)}
                          className="h-9 flex-1 rounded-full bg-[#C2185B] text-[13px] font-medium text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : customActions ? (
                    actions.map((action, index) => (
                      <React.Fragment key={action.label}>
                        {action.destructive && index > 0 && (
                          <div className="my-1 h-px bg-black/[0.06]" />
                        )}
                        <MenuItem
                          icon={action.icon || PenLine}
                          destructive={action.destructive}
                          onClick={() => {
                            if (action.confirm) {
                              setPendingAction(action);
                              setConfirming(true);
                            } else {
                              choose(action.onClick);
                            }
                          }}
                        >
                          {action.label}
                        </MenuItem>
                      </React.Fragment>
                    ))
                  ) : (
                    <>
                      <MenuItem
                        icon={isDraft ? PenLine : BookOpen}
                        onClick={() => choose(onOpen)}
                      >
                        {isDraft ? 'Continue editing' : 'Read journal'}
                      </MenuItem>
                      <MenuItem icon={Send} onClick={() => choose(onPublish)}>
                        {isDraft ? 'Publish now' : 'Edit journal'}
                      </MenuItem>
                      <div className="my-1 h-px bg-black/[0.06]" />
                      <MenuItem
                        icon={Trash2}
                        destructive
                        onClick={() => {
                          setPendingAction({ onClick: onDelete });
                          setConfirming(true);
                        }}
                      >
                        {isDraft ? 'Delete draft' : 'Delete journal'}
                      </MenuItem>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

function MenuItem({ icon: Icon, children, onClick, destructive = false }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={`flex h-10 w-full items-center gap-2.5 rounded-[13px] px-3 text-left text-[14px] font-medium outline-none transition-colors focus-visible:bg-[#F5F1F3] ${
        destructive
          ? 'text-[#C2185B] hover:bg-[#FCE8F0]'
          : 'text-[#211D21] hover:bg-[#F5F1F3]'
      }`}
    >
      <Icon size={17} strokeWidth={1.9} />
      {children}
    </button>
  );
}

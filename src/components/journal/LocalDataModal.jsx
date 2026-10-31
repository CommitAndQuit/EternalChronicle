import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Download, HardDrive, ShieldCheck, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LocalDataModal({
  open,
  onClose,
  journals,
  onImport,
}) {
  const reduceMotion = useReducedMotion();
  const fileInputRef = useRef(null);
  const [notification, setNotification] = useState(null);

  const notify = (msg, isError = false) => {
    setNotification({ msg, isError });
    window.setTimeout(() => setNotification(null), 3500);
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(journals, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const now = new Date().toISOString().slice(0, 10);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eternal-chronicle-backup-${now}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      notify('Backup exported successfully!');
    } catch (err) {
      console.error('Failed to export:', err);
      notify('Failed to export backup.', true);
    }
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result);
        if (!Array.isArray(parsed)) {
          throw new Error('Invalid format: root must be an array');
        }
        const valid = parsed.filter(
          (j) => j && typeof j.id === 'string' && typeof j.title === 'string'
        );
        if (valid.length === 0) {
          throw new Error('No valid journal entries found in file');
        }
        onImport(valid);
        notify(`Restored ${valid.length} journals from backup!`);
      } catch (err) {
        console.error('Failed to import backup:', err);
        notify('Invalid backup file. Please choose a valid JSON export.', true);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="local-data-title"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.95, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.95, y: reduceMotion ? 0 : 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_24px_70px_rgba(20,12,20,0.3)] md:p-8"
          >
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#5E3474]/10 text-[#5E3474]">
                  <ShieldCheck size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 id="local-data-title" className="text-[19px] font-semibold text-[#1A171A]">
                    Local Browser App
                  </h3>
                  <p className="text-[12px] text-black/40">100% Private & Device-Only</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="grid h-9 w-9 place-items-center rounded-full text-black/50 hover:bg-black/[0.06] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-[18px] bg-[#FAF9F8] p-4 text-[13.5px] leading-relaxed text-[#5A545A]">
              All your journals, photos, and memories are stored directly inside your browser using{' '}
              <strong className="font-semibold text-[#1A171A]">IndexedDB</strong>. No data is ever sent to
              any server or cloud. It runs entirely on your local machine even without an internet
              connection.
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[18px] border border-black/[0.06] p-3.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/40">
                  Storage Status
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[14px] font-semibold text-[#1A171A]">
                  <HardDrive size={16} className="text-[#5E3474]" />
                  <span>IndexedDB Local</span>
                </div>
              </div>
              <div className="rounded-[18px] border border-black/[0.06] p-3.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/40">
                  Saved Entries
                </p>
                <p className="mt-1 text-[16px] font-semibold text-[#1A171A]">
                  {journals.length} {journals.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>
            </div>

            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] ${
                  notification.isError
                    ? 'bg-[#FCE8F0] text-[#A3144B]'
                    : 'bg-[#E8F5E9] text-[#2E7D32]'
                }`}
              >
                {notification.isError ? (
                  <AlertCircle size={16} className="shrink-0" />
                ) : (
                  <CheckCircle2 size={16} className="shrink-0" />
                )}
                <span>{notification.msg}</span>
              </motion.div>
            )}

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleExport}
                className="flex h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#5E3474] text-[15px] font-medium text-white shadow-[0_8px_20px_rgba(94,52,116,0.25)] outline-none transition-transform active:scale-[0.985] hover:bg-[#522c66]"
              >
                <Download size={18} strokeWidth={2} />
                Export Backup (JSON)
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-[48px] w-full items-center justify-center gap-2 rounded-full border border-black/[0.12] bg-white text-[15px] font-medium text-[#2E282E] outline-none transition-colors hover:bg-black/[0.03] active:scale-[0.985]"
              >
                <Upload size={18} strokeWidth={2} />
                Restore from Backup
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
                aria-label="Upload JSON backup file"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

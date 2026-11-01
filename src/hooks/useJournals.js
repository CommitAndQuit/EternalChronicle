import { useCallback, useEffect, useState } from 'react';
import { loadEntries, saveEntries } from '../storage';
import { buildSeedJournals } from '../data/seedJournals';
import { TITLE_MODEL, titleFor } from '../lib/title';

const SEED_KEY = 'eternal-chronicle:journals:seeded:v1';

const isJournal = (entry) =>
  Boolean(
    entry &&
      typeof entry === 'object' &&
      typeof entry.id === 'string' &&
      typeof entry.title === 'string' &&
      (entry.status === 'draft' || entry.status === 'published'),
  );

// Make sure legacy entries and existing drafts always have a usable title.
const backfillTitles = (entries) => {
  let changed = false;
  const next = entries.map((entry) => {
    if (entry.title && entry.title.trim()) {
      if (entry.titleSource) return entry;
      changed = true;
      return { ...entry, titleSource: 'user' };
    }
    changed = true;
    return {
      ...entry,
      title: titleFor({
        content: entry.content,
        journalDate: entry.journalDate,
        category: entry.category,
      }),
      titleSource: 'auto',
      titleModel: TITLE_MODEL,
    };
  });
  return { entries: next, changed };
};

let bootstrapPromise;

function bootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const stored = await loadEntries();
      const valid = (Array.isArray(stored) ? stored : []).filter(isJournal);
      let seeded = false;
      try {
        seeded = window.localStorage.getItem(SEED_KEY) === '1';
      } catch {
        seeded = false;
      }

      let initial = valid;
      let shouldSave = false;

      if (!seeded) {
        initial = valid.length ? valid : buildSeedJournals();
        try {
          window.localStorage.setItem(SEED_KEY, '1');
        } catch {
          /* private mode */
        }
        shouldSave = true;
      }

      const backfilled = backfillTitles(initial);
      initial = backfilled.entries;
      shouldSave = shouldSave || backfilled.changed;

      if (shouldSave) await saveEntries(initial);
      return initial;
    })();
  }
  return bootstrapPromise;
}

export default function useJournals() {
  const [journals, setJournals] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    bootstrap().then((initial) => {
      if (!mounted) return;
      setJournals(initial);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveEntries(journals);
  }, [journals, ready]);

  const addJournal = useCallback((journal) => {
    setJournals((current) => [journal, ...current.filter((item) => item.id !== journal.id)]);
    return journal;
  }, []);

  const updateJournal = useCallback((journal) => {
    const next = {
      ...journal,
      updatedAt: new Date().toISOString(),
    };
    setJournals((current) =>
      current.map((item) => (item.id === next.id ? next : item)),
    );
    return next;
  }, []);

  const publishJournal = useCallback((journal) => {
    const now = new Date().toISOString();
    const published = {
      ...journal,
      status: 'published',
      publishedAt: now,
      updatedAt: now,
    };
    setJournals((current) =>
      current.map((item) => (item.id === published.id ? published : item)),
    );
    return published;
  }, []);

  const deleteJournal = useCallback((id) => {
    setJournals((current) => current.filter((item) => item.id !== id));
  }, []);

  const importJournals = useCallback((incoming) => {
    if (!Array.isArray(incoming)) return;
    const valid = incoming.filter(isJournal);
    setJournals(valid);
    saveEntries(valid);
  }, []);

  return {
    journals,
    ready,
    addJournal,
    updateJournal,
    publishJournal,
    deleteJournal,
    importJournals,
  };
}

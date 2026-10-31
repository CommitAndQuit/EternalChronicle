const ENTRIES_KEY = 'journalEntries';
const DB_NAME = 'EternalChronicleDB';
const DB_VERSION = 1;

const initDB = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('entries')) {
        db.createObjectStore('entries', { keyPath: 'id' });
      }
    };
  });

const readLocal = () => {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeLocal = (entries) => {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save entries locally:', error);
  }
};

export const loadEntries = async () => {
  try {
    if ('indexedDB' in window) {
      const db = await initDB();
      const transaction = db.transaction(['entries'], 'readonly');
      const request = transaction.objectStore('entries').getAll();
      const entries = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
      // Prefer IndexedDB, but recover if it has never been populated.
      return entries.length ? entries : readLocal();
    }
    return readLocal();
  } catch (error) {
    console.error('Failed to load entries from IndexedDB:', error);
    return readLocal();
  }
};

export const saveEntries = async (entries) => {
  try {
    if ('indexedDB' in window) {
      const db = await initDB();
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(['entries'], 'readwrite');
        const store = transaction.objectStore('entries');
        store.clear();
        entries.forEach((entry) => store.put(entry));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    }
    writeLocal(entries);
  } catch (error) {
    console.error('Failed to save entries to IndexedDB:', error);
    writeLocal(entries);
  }
};

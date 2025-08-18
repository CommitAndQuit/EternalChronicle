const ENTRIES_KEY = 'journalEntries';

export const loadEntries = () => {
  try {
    const entriesJson = localStorage.getItem(ENTRIES_KEY);
    if (entriesJson === null) {
      return [];
    }
    return JSON.parse(entriesJson);
  } catch (error) {
    console.error("Failed to load entries from local storage:", error);
    return [];
  }
};

export const saveEntries = (entries) => {
  try {
    const entriesJson = JSON.stringify(entries);
    localStorage.setItem(ENTRIES_KEY, entriesJson);
  } catch (error) {
    console.error("Failed to save entries to local storage:", error);
  }
};

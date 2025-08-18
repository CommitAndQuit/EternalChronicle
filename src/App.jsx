import React, { useState, useEffect } from 'react';
import MainLayout from './components/MainLayout';
import Header from './components/Header';
import ChatFeed from './components/ChatFeed';
import NavigationBar from './components/NavigationBar';
import AddStoryLayout from './components/AddStoryLayout';
import AddStoryHeader from './components/AddStoryHeader';
import StoryInput from './components/StoryInput';
import MetadataBar from './components/MetadataBar';
import { loadEntries, saveEntries } from './storage';

function App() {
  const [isWriting, setIsWriting] = useState(false);
  const [newStoryText, setNewStoryText] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);

  useEffect(() => {
    const entries = loadEntries();
    setJournalEntries(entries);
  }, []);

  const handleStartWriting = () => {
    setNewStoryText(''); // Clear previous text
    setIsWriting(true);
  };

  const handleCloseWriting = () => {
    if (newStoryText.trim() !== '') {
      const newEntry = {
        id: Date.now(),
        entryText: newStoryText,
        timestamp: new Date().toISOString(),
      };
      const updatedEntries = [newEntry, ...journalEntries];
      setJournalEntries(updatedEntries);
      saveEntries(updatedEntries);
    }
    setIsWriting(false);
    setNewStoryText(''); // Clear text after saving/closing
  };

  if (isWriting) {
    return (
      <AddStoryLayout>
        <AddStoryHeader onClose={handleCloseWriting} />
        <StoryInput
          value={newStoryText}
          onChange={(e) => setNewStoryText(e.target.value)}
        />
        <MetadataBar />
      </AddStoryLayout>
    );
  }

  return (
    <MainLayout>
      <Header onAddClick={handleStartWriting} />
      <ChatFeed onAddClick={handleStartWriting} entries={journalEntries} />
      <NavigationBar />
    </MainLayout>
  );
}

export default App;

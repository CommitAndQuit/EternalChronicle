import React from 'react';
import AddStoryCard from './AddStoryCard';

const ChatBubble = ({ message, sender }) => {
  const bubbleClass = sender === 'bot'
    ? 'bg-gray-200 text-primary-text self-start rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
    : 'bg-accent text-white self-end rounded-tl-2xl rounded-bl-2xl rounded-br-2xl';

  return (
    <div className={`max-w-xs md:max-w-md p-3 my-2 ${bubbleClass}`}>
      <p>{message}</p>
    </div>
  );
};

const ChatFeed = ({ onAddClick, entries = [] }) => {
  return (
    <main className="flex-1 overflow-y-auto p-4 flex flex-col">
      <ChatBubble message="Good morning, Lily!" sender="bot" />
      {entries.slice().reverse().map((entry) => (
        <ChatBubble key={entry.id} message={entry.entryText} sender="user" />
      ))}
      <AddStoryCard onAddClick={onAddClick} />
    </main>
  );
};

export default ChatFeed;

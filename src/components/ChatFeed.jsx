import React from 'react';
import AddStoryCard from './AddStoryCard';
import PullToRefresh from './PullToRefresh';

const ChatBubble = ({ message, sender, attachments = [] }) => {
  const bubbleClass = sender === 'bot'
    ? 'bg-gray-100 text-brand-deep self-start rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
    : 'bg-brand-bright text-white self-end rounded-tl-2xl rounded-bl-2xl rounded-br-2xl';

  return (
    <div className={`max-w-[85%] my-2 ${bubbleClass}`}>
      <div className="p-3">
        <p className="text-sm md:text-base">{message}</p>
      </div>

      {/* Display attachments */}
      {attachments && attachments.length > 0 && (
        <div className="px-3 pb-3">
          <div className="flex flex-wrap gap-2 mt-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="max-w-full">
                {attachment.type === 'image' && (
                  <img
                    src={attachment.data}
                    alt={attachment.name}
                    className="rounded-lg max-w-full h-auto"
                    style={{ maxHeight: '250px' }}
                  />
                )}
                {attachment.type === 'audio' && (
                  <audio
                    controls
                    className="max-w-full"
                    style={{ maxWidth: '250px' }}
                  >
                    <source src={attachment.data} type="audio/wav" />
                    Your browser does not support audio playback.
                  </audio>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ChatFeed = ({ onAddClick, entries = [], onRefresh, isSearchActive }) => {
  const handleRefresh = async () => {
    // Simple refresh - could be extended to sync with server later
    if (onRefresh) {
      await onRefresh();
    }
  };

  return (
    <main className="flex-1 h-full">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="p-4 flex flex-col">
          {isSearchActive && entries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No entries found matching your search.
            </div>
          )}

          {!isSearchActive && <ChatBubble message="Good morning, Lily!" sender="bot" />}

          {entries.slice().reverse().map((entry) => (
            <ChatBubble
              key={entry.id}
              message={entry.entryText}
              sender="user"
              attachments={entry.attachments}
            />
          ))}

          {!isSearchActive && <AddStoryCard onAddClick={onAddClick} />}
        </div>
      </PullToRefresh>
    </main>
  );
};

export default ChatFeed;

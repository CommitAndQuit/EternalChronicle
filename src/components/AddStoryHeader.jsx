import React from 'react';
import { Bot, X } from 'lucide-react';

const AddStoryHeader = ({ onClose }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-primary-background shadow-sm">
      <div className="flex items-center gap-2">
        <Bot className="text-accent" size={28} />
        <span className="text-lg font-bold text-primary-text">New Story</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-secondary-text font-medium">12:30</span>
        <button onClick={onClose} className="text-secondary-text">
          <X size={28} />
        </button>
      </div>
    </header>
  );
};

export default AddStoryHeader;

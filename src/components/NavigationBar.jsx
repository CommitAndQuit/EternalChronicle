import React from 'react';
import { Pencil, Waves, User, MessageSquare } from 'lucide-react';

const NavigationBar = () => {
  return (
    <nav className="flex items-center justify-around p-3 bg-primary-background border-t border-gray-200">
      <button className="flex flex-col items-center text-accent">
        <Pencil size={24} />
        <span className="text-xs font-medium">Write</span>
      </button>
      <button className="flex flex-col items-center text-secondary-text">
        <Waves size={24} />
        <span className="text-xs font-medium">Mood</span>
      </button>
      <button className="flex flex-col items-center text-secondary-text">
        <User size={24} />
        <span className="text-xs font-medium">Profile</span>
      </button>
      <button className="flex flex-col items-center text-secondary-text">
        <MessageSquare size={24} />
        <span className="text-xs font-medium">Entries</span>
      </button>
    </nav>
  );
};

export default NavigationBar;

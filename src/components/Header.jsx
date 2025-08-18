import React from 'react';
import { Bot, Settings, PlusCircle } from 'lucide-react';

const Header = ({ onAddClick }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-primary-background shadow-sm">
      <div className="flex items-center gap-2">
        <Bot className="text-accent" size={28} />
        <span className="text-lg font-bold text-primary-text">Journal</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-secondary-text font-medium">12:30</span>
        <Settings className="text-secondary-text" size={24} />
        <button onClick={onAddClick}>
          <PlusCircle className="text-accent" size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;

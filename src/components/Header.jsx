import React from 'react';
import { Settings, Plus, Search } from 'lucide-react';
import SearchAndExport from './SearchAndExport';

const Header = ({ onAddClick, entries, onSearchResults }) => {
  return (
    <header className="bg-white pt-12 pb-4 px-6 border-b border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-brand-deep tracking-tight">
          My Journal
        </h1>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Search size={24} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Settings size={24} />
          </button>
          <button 
            onClick={onAddClick}
            className="bg-brand-bright text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <button className="text-brand-bright font-bold border-b-2 border-brand-bright pb-1">All</button>
          <button className="text-gray-400 font-medium pb-1">Personal</button>
          <button className="text-gray-400 font-medium pb-1">Work</button>
        </div>
        <SearchAndExport entries={entries} onSearchResults={onSearchResults} />
      </div>
    </header>
  );
};

export default Header;
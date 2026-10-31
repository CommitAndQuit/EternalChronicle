import React, { useState } from 'react';
import { Search, Download, X } from 'lucide-react';

const SearchAndExport = ({ entries = [], onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      onSearchResults(null); // Clear search results
      return;
    }

    const filtered = entries.filter(entry =>
      entry.entryText.toLowerCase().includes(query.toLowerCase()) ||
      (entry.attachments && entry.attachments.some(att =>
        att.name && att.name.toLowerCase().includes(query.toLowerCase())
      ))
    );
    onSearchResults(filtered);
  };

  const exportEntries = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      entries: entries.map(entry => ({
        ...entry,
        // Remove large data URLs from export to keep file size manageable
        attachments: entry.attachments?.map(att => ({
          ...att,
          data: att.type === 'image' ? '[IMAGE DATA]' : att.data // Keep audio data but mark images
        }))
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `journal_export_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex items-center gap-2 p-2">
      {/* Search toggle button */}
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Search size={20} />
      </button>

      {/* Export button */}
      <button
        onClick={exportEntries}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Export journal entries"
      >
        <Download size={20} />
      </button>

      {/* Search input */}
      {isSearchOpen && (
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 pl-8 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  handleSearch('');
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
              handleSearch('');
            }}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchAndExport;

import React, { useState } from 'react';
import AddStoryCard from './AddStoryCard';
import { Calendar, Star, Clock } from 'lucide-react';
import PullToRefresh from './PullToRefresh';

const Dashboard = ({ entries, onAddClick, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All', icon: <Clock size={18} /> },
    { id: 'recent', label: 'Recent', icon: <Calendar size={18} /> },
    { id: 'favorites', label: 'Favorites', icon: <Star size={18} /> },
  ];

  const filteredEntries = entries.filter(entry => {
    if (activeTab === 'all') return true;
    // For now, just return all for simplicity in this prototype
    return true;
  });

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="flex-1 pb-20">
        {/* Add Story Card */}
        <AddStoryCard onAddClick={onAddClick} />

        {/* Tabs */}
        <div className="flex px-4 gap-4 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-bright text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Entries List */}
        <div className="px-4 space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No stories yet. Start your journey today!</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-gray-400">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-brand-deep font-medium line-clamp-3">
                  {entry.entryText}
                </p>
                {entry.attachments && entry.attachments.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {entry.attachments.slice(0, 2).map((att, idx) => (
                      <div key={idx} className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        {att.type === 'image' && (
                          <img src={att.data} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                    {entry.attachments.length > 2 && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                        +{entry.attachments.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};

export default Dashboard;

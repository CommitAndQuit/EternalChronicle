import React, { useState } from 'react';
import { ArrowLeft, Image as ImageIcon, Calendar, Check, X } from 'lucide-react';

const CreateEditJournal = ({ journal, onBack, onPublish, onCancel }) => {
  const [title, setTitle] = useState(journal ? journal.title : '');
  const [content, setContent] = useState(journal ? journal.content : '');
  const [category, setCategory] = useState(journal ? journal.category : 'Daily Life');
  const [showCategorySheet, setShowCategorySheet] = useState(false);

  const categories = ['Holiday', 'Surprise', 'Daily Life', 'Sports'];

  const handlePublish = () => {
    onPublish({
      ...journal,
      title,
      content,
      category,
      isDraft: false,
      timestamp: 'Just now'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Navigation Bar */}
      <div className="px-4 py-4 flex items-center justify-between border-b">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">
          {journal ? 'Edit Journal' : 'Create Journal'}
        </h2>
        <button 
          onClick={handlePublish}
          className="bg-[#D81B60] text-white px-5 py-2 rounded-full font-semibold text-sm shadow-md active:scale-95 transition-transform"
        >
          Publish
        </button>
      </div>

      {/* Form Elements */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold border-none focus:ring-0 placeholder-gray-300"
        />

        <div className="flex items-center gap-2 text-gray-500 py-2 border-y border-gray-50">
          <Calendar size={18} />
          <span className="text-sm">+ Add Date</span>
        </div>

        <textarea
          placeholder="Write your story..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-48 text-gray-700 border-none focus:ring-0 resize-none placeholder-gray-300"
        />

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
            <ImageIcon size={24} />
          </div>
          <p className="text-sm text-gray-400">Add photos or videos</p>
        </div>

        <button 
          onClick={() => setShowCategorySheet(true)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl text-gray-700 font-medium"
        >
          <span>Category: <span className="text-[#5B2D53]">{category}</span></span>
          <span className="text-xs text-gray-400">Change</span>
        </button>
      </div>

      {/* Bottom Sheet / Modal (Choose Category) */}
      {showCategorySheet && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCategorySheet(false)}
          />
          <div className="relative w-full bg-white rounded-t-[32px] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-800 mb-6">Choose Category</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setShowCategorySheet(false);
                  }}
                  className={`py-4 rounded-2xl font-medium transition-all ${
                    category === cat 
                      ? 'bg-[#5B2D53] text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowCategorySheet(false)}
              className="w-full bg-[#D81B60] text-white py-4 rounded-full font-bold shadow-lg active:scale-95 transition-transform"
            >
              {journal ? 'Edit Draft' : 'Save Selection'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEditJournal;

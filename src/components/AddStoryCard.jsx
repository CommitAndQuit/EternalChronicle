import React from 'react';
import { Pencil } from 'lucide-react';

const AddStoryCard = ({ onAddClick }) => {
  return (
    <div
      onClick={onAddClick}
      className="bg-brand-bright rounded-2xl p-6 m-4 flex flex-col items-center justify-center text-center cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
    >
      <div className="bg-white/20 rounded-full p-4 mb-4">
        <Pencil className="text-white" size={40} />
      </div>
      <p className="text-white font-bold text-lg tracking-wider">
        ADD TODAY'S STORY
      </p>
    </div>
  );
};

export default AddStoryCard;

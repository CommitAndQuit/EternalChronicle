import React from 'react';
import { Pencil } from 'lucide-react';

const AddStoryCard = ({ onAddClick }) => {
  return (
    <div
      onClick={onAddClick}
      className="bg-primary-ui rounded-2xl p-6 m-4 flex flex-col items-center justify-center text-center cursor-pointer shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="border-2 border-dashed border-white rounded-full p-4">
        <Pencil className="text-white" size={40} />
      </div>
      <p className="mt-4 text-white font-bold text-lg tracking-wider">
        ADD TODAY'S STORY
      </p>
    </div>
  );
};

export default AddStoryCard;

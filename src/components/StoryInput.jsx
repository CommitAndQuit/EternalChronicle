import React from 'react';

const StoryInput = ({ value, onChange }) => {
  return (
    <div className="flex-1 p-4 bg-white">
      <textarea
        value={value}
        onChange={onChange}
        placeholder="Tell your story..."
        className="w-full h-full p-2 text-lg text-primary-text bg-transparent border-none focus:ring-0 resize-none leading-relaxed"
        style={{
          backgroundImage: 'linear-gradient(to bottom, transparent 29px, #F3F4F6 30px)',
          backgroundSize: '100% 30px',
          lineHeight: '30px',
        }}
      />
    </div>
  );
};

export default StoryInput;

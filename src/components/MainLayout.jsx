import React from 'react';

const MainLayout = ({ children }) => {
  return (
    <div className="bg-gray-50 w-full min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-md h-screen bg-white shadow-2xl flex flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;

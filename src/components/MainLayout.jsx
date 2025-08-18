import React from 'react';

const MainLayout = ({ children }) => {
  return (
    <div className="bg-app-background w-full min-h-screen font-sans">
      <div className="max-w-md mx-auto h-screen bg-primary-background flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;

import React from 'react';

export default function AppShell({ children }) {
  return (
    <div className="min-h-[100dvh] w-full bg-[#FAF9F8]">
      <div className="relative h-[100dvh] w-full overflow-hidden bg-[#FAF9F8]">
        {children}
      </div>
    </div>
  );
}

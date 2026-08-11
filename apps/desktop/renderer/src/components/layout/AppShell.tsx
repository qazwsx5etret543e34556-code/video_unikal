import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background p-6">
        {children || <Outlet />}
      </main>
    </div>
  );
}

export default AppShell;

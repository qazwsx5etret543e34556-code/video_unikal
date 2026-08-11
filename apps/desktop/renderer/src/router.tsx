import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import QueuePage from './pages/QueuePage';
import PresetsPage from './pages/PresetsPage';
import SettingsPage from './pages/SettingsPage';
import LicensePage from './pages/LicensePage';
import LogsPage from './pages/LogsPage';

export function AppRouter() {
  return (
    <BrowserRouter basename="/">
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/queue" replace />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/presets" element={<PresetsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/license" element={<LicensePage />} />
          <Route path="/logs" element={<LogsPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default AppRouter;

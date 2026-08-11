import React from 'react';
import { AppRouter } from './router';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="bottom-right" richColors />
    </>
  );
}

export default App;

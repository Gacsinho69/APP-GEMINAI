
import React, { useState } from 'react';
import Wizard from './components/Wizard';
import AdminConfig from './components/AdminConfig';
import { AppProvider } from './hooks/useScenario.tsx'; // Assuming useScenario provides a context provider

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="container mx-auto max-w-4xl bg-white shadow-lg rounded-lg p-6">
          <header className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Customs Cost Calculator</h1>
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {isAdminMode ? 'Exit Admin Mode' : 'Admin Settings'}
            </button>
          </header>

          {isAdminMode ? (
            <AdminConfig />
          ) : (
            <Wizard />
          )}
        </div>
      </div>
    </AppProvider>
  );
};

export default App;

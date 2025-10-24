
import React, { useState } from 'react';
import Wizard from './components/Wizard';
import AdminConfig from './components/AdminConfig';
import { AppProvider } from './hooks/useScenario.tsx'; // Assuming useScenario provides a context provider

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="container mx-auto max-w-5xl bg-white shadow-xl rounded-xl p-8 border border-slate-200">
          <header className="mb-8 flex justify-between items-center border-b border-slate-200 pb-6">
            <h1 className="text-4xl font-bold text-slate-800">Calculadora de Costos Aduaneros</h1>
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg font-medium"
            >
              {isAdminMode ? 'Salir Admin' : 'Configuración'}
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


import React, { useState, useEffect } from 'react';
import GeneralInfoStep from './steps/GeneralInfoStep';
import ParcelInfoStep from './steps/ParcelInfoStep';
import CIFPriceStep from './steps/CIFPriceStep';
import ChileCustomsStep from './steps/ChileCustomsStep';
import TotalsUnitEconomicsStep from './steps/TotalsUnitEconomicsStep';
import MarkupProfitStep from './steps/MarkupProfitStep';
import { useScenario } from '../hooks/useScenario.tsx';
import { Scenario } from '../types';
import { scenarioService } from '../services/scenarioService';

const steps = [
  { name: 'General Info', component: GeneralInfoStep },
  { name: 'Parcel Info', component: ParcelInfoStep },
  { name: 'CIF Price', component: CIFPriceStep },
  { name: 'Chile Customs', component: ChileCustomsStep },
  { name: 'Totals & Unit Economics', component: TotalsUnitEconomicsStep },
  { name: 'Markup & Profit', component: MarkupProfitStep },
];

const Wizard: React.FC = () => {
  const { scenario, updateScenario, saveCurrentScenario, loadScenarioById, getScenarioList, clearCurrentScenario, deleteScenarioById, exportScenarioAsText } = useScenario();
  const [currentStep, setCurrentStep] = useState(0);
  const [savedScenarios, setSavedScenarios] = useState<
    { id: string; name: string; date: string }[]
  >([]);
  const [scenarioName, setScenarioName] = useState<string>('');

  useEffect(() => {
    setSavedScenarios(getScenarioList());
    if (scenario.generalInfo.nameOfGoods) {
      setScenarioName(scenario.generalInfo.nameOfGoods);
    }
  }, [scenario, getScenarioList]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLoadScenario = (id: string) => {
    loadScenarioById(id);
    setScenarioName(scenarioService.getScenarioById(id)?.generalInfo.nameOfGoods || '');
    setSavedScenarios(getScenarioList()); // Refresh list
    setCurrentStep(0); // Go back to start of wizard
  };

  const handleSaveScenario = () => {
    if (scenarioName.trim() === '') {
      alert('Please enter a name for the scenario before saving.');
      return;
    }
    const id = saveCurrentScenario(scenarioName);
    setSavedScenarios(getScenarioList()); // Refresh list
    alert(`Scenario "${scenarioName}" saved! ID: ${id}`);
  };

  const handleNewScenario = () => {
    clearCurrentScenario();
    setScenarioName('');
    setCurrentStep(0);
    setSavedScenarios(getScenarioList()); // Refresh list
  };

  const handleDeleteScenario = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete scenario "${name}"?`)) {
      deleteScenarioById(id);
      setSavedScenarios(getScenarioList()); // Refresh list
    }
  };

  const handleExportScenario = () => {
    if (!scenario.generalInfo.nameOfGoods) {
      alert('Please complete the general info before exporting.');
      return;
    }
    const textData = exportScenarioAsText();
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${scenario.generalInfo.nameOfGoods.replace(/\s/g, '_')}_customs_cost.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    alert('Scenario exported as text file!');
    // PDF and Excel export would require server-side rendering or more complex client-side libraries.
    // This is a placeholder for basic text export.
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-semibold text-slate-700">Paso {currentStep + 1}: {steps[currentStep].name}</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Nombre del Escenario"
            className="p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
          />
          <button
            onClick={handleSaveScenario}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md font-medium"
          >
            Guardar
          </button>
          <button
            onClick={handleNewScenario}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium"
          >
            Nuevo
          </button>
          <button
            onClick={handleExportScenario}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all shadow-sm hover:shadow-md font-medium"
          >
            Exportar
          </button>
        </div>
      </div>

      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <button
            key={step.name}
            onClick={() => setCurrentStep(index)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${index === currentStep
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            {step.name}
          </button>
        ))}
      </div>

      <div className="border border-slate-200 p-6 rounded-xl shadow-sm bg-white">
        <CurrentStepComponent scenario={scenario} updateScenario={updateScenario} />
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-6 py-2.5 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
        >
          Siguiente
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Escenarios Guardados</h3>
        {savedScenarios.length === 0 ? (
          <p className="text-slate-500">No hay escenarios guardados aún.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedScenarios.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <span className="font-medium text-slate-800">{s.name}</span>
                  <p className="text-sm text-slate-500">{new Date(s.date).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLoadScenario(s.id)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors font-medium"
                  >
                    Cargar
                  </button>
                  <button
                    onClick={() => handleDeleteScenario(s.id, s.name)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors font-medium"
                  >
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Wizard;

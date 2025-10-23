
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-700">Step {currentStep + 1}: {steps[currentStep].name}</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Scenario Name"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
          />
          <button
            onClick={handleSaveScenario}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Save Scenario
          </button>
          <button
            onClick={handleNewScenario}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            New Scenario
          </button>
          <button
            onClick={handleExportScenario}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            Export (Text)
          </button>
        </div>
      </div>

      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <button
            key={step.name}
            onClick={() => setCurrentStep(index)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${index === currentStep
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {step.name}
          </button>
        ))}
      </div>

      <div className="border border-gray-200 p-6 rounded-lg shadow-sm bg-white">
        <CurrentStepComponent scenario={scenario} updateScenario={updateScenario} />
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Saved Scenarios</h3>
        {savedScenarios.length === 0 ? (
          <p className="text-gray-500">No scenarios saved yet.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedScenarios.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div>
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <p className="text-sm text-gray-500">{new Date(s.date).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLoadScenario(s.id)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDeleteScenario(s.id, s.name)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Delete
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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { AdminConfigState, Currency, Scenario } from '../types';
import { DEFAULT_ADMIN_CONFIG, INITIAL_SCENARIO } from '../constants';
import { calculationService } from '../services/calculationService';
import { fxService } from '../services/fxService';
import { aduanaService } from '../services/aduanaService';
import { scenarioService } from '../services/scenarioService';

interface ScenarioContextType {
  scenario: Scenario;
  adminConfig: AdminConfigState;
  updateScenario: (newScenario: Scenario) => void;
  updateAdminConfig: (newConfig: AdminConfigState) => void;
  calculateScenario: () => void;
  saveCurrentScenario: (name: string) => string;
  loadScenarioById: (id: string) => void;
  getScenarioList: () => { id: string; name: string; date: string }[];
  clearCurrentScenario: () => void;
  deleteScenarioById: (id: string) => void;
  exportScenarioAsText: () => string;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [scenario, setScenario] = useState<Scenario>(INITIAL_SCENARIO);
  const [adminConfig, setAdminConfig] = useState<AdminConfigState>(
    DEFAULT_ADMIN_CONFIG,
  );

  // Load admin config from localStorage on mount
  useEffect(() => {
    try {
      const savedAdminConfig = localStorage.getItem('adminConfig');
      if (savedAdminConfig) {
        setAdminConfig(JSON.parse(savedAdminConfig));
      }
    } catch (error) {
      console.error("Failed to parse adminConfig from localStorage", error);
      // Optional: clear the corrupted item to prevent future errors
      localStorage.removeItem('adminConfig');
    }
  }, []);

  // Persist admin config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminConfig', JSON.stringify(adminConfig));
  }, [adminConfig]);

  const updateScenario = useCallback((newScenario: Scenario) => {
    setScenario(newScenario);
  }, []);

  const updateAdminConfig = useCallback((newConfig: AdminConfigState) => {
    setAdminConfig(newConfig);
  }, []);

  const calculateScenario = useCallback(async () => {
    const currentAdminConfig = adminConfig;

    // Create a new scenario object to avoid direct mutation
    const scenarioToCalculate = {
      ...scenario,
      calculations: { ...scenario.calculations },
    };

    // Fetch live FX rate and update the copied scenario object
    if (scenarioToCalculate.generalInfo.originCurrency !== Currency.USD) {
      try {
        const rate = await fxService.getFxRateToUsd(
          scenarioToCalculate.generalInfo.originCurrency,
          currentAdminConfig.fxSpreadPercentage,
        );
        scenarioToCalculate.calculations.fxRateToUsd = rate;
      } catch (error) {
        console.error('Failed to fetch live FX rate:', error);
        scenarioToCalculate.calculations.fxRateToUsd = 1; // Fallback
      }
    } else {
      scenarioToCalculate.calculations.fxRateToUsd = 1;
    }

    const { newCalculations, effectiveAdValoremRate, effectiveIvaRate } =
      calculationService.calculateAll(
        scenarioToCalculate,
        currentAdminConfig,
      );

    setScenario((prev) => ({
      ...prev,
      calculations: newCalculations,
      chileCustoms: {
        ...prev.chileCustoms,
        adValoremRate: effectiveAdValoremRate,
        ivaRate: effectiveIvaRate,
      },
    }));
  }, [scenario, adminConfig]);

  // Initial calculation on mount
  useEffect(() => {
    calculateScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const saveCurrentScenario = useCallback(
    (name: string): string => {
      const id = scenarioService.saveScenario(scenario, name);
      setScenario((prev) => ({
        ...prev,
        generalInfo: { ...prev.generalInfo, nameOfGoods: name },
      })); // Update current scenario's name
      return id;
    },
    [scenario],
  );

  const loadScenarioById = useCallback((id: string) => {
    const loaded = scenarioService.getScenarioById(id);
    if (loaded) {
      setScenario(loaded);
      alert(`Scenario "${loaded.generalInfo.nameOfGoods}" loaded!`);
    } else {
      alert('Scenario not found.');
    }
  }, []);

  const getScenarioList = useCallback(() => {
    return scenarioService.getScenarioList();
  }, []);

  const clearCurrentScenario = useCallback(() => {
    setScenario(INITIAL_SCENARIO);
    calculateScenario(); // Recalculate with initial state
  }, [calculateScenario]);

  const deleteScenarioById = useCallback((id: string) => {
    scenarioService.deleteScenario(id);
  }, []);

  const exportScenarioAsText = useCallback(() => {
    return scenarioService.exportScenarioAsText(scenario);
  }, [scenario]);

  const value = {
    scenario,
    adminConfig,
    updateScenario,
    updateAdminConfig,
    calculateScenario,
    saveCurrentScenario,
    loadScenarioById,
    getScenarioList,
    clearCurrentScenario,
    deleteScenarioById,
    exportScenarioAsText,
  };

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = (): ScenarioContextType => {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error('useScenario must be used within an AppProvider');
  }
  return context;
};

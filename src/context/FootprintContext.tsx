"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CarbonData, ActionItem } from '../types';
import { calculateMonthlyCarbon } from '../utils/carbonEngine';

interface FootprintContextType {
  carbonData: CarbonData;
  setCarbonData: React.Dispatch<React.SetStateAction<CarbonData>>;
  monthlyEmissions: ReturnType<typeof calculateMonthlyCarbon>;
  actions: ActionItem[];
  setActions: React.Dispatch<React.SetStateAction<ActionItem[]>>;
  toggleActionCompleted: (id: string) => void;
  streak: number;
}

const defaultCarbonData: CarbonData = {
  transportation: { kmPerDay: 10, vehicleType: 'car' },
  homeEnergy: { electricityKwhPerMonth: 200, heatingType: 'gas' },
  diet: 'average',
  waste: 'average',
};

const FootprintContext = createContext<FootprintContextType | undefined>(undefined);

export const FootprintProvider = ({ children }: { children: ReactNode }) => {
  const [carbonData, setCarbonData] = useState<CarbonData>(defaultCarbonData);
  const [actions, setActions] = useState<ActionItem[]>([
    { id: '1', title: 'Use a reusable bag', description: 'Save plastic waste today', co2SavedKg: 0.5, completed: false },
    { id: '2', title: 'Take public transit', description: 'Swap one car trip', co2SavedKg: 2.0, completed: false },
  ]);
  const [streak, setStreak] = useState(12);

  const monthlyEmissions = calculateMonthlyCarbon(carbonData);

  const toggleActionCompleted = (id: string) => {
    setActions(prev => prev.map(a => {
      if (a.id === id) {
        if (!a.completed) {
          // Increment streak on first action of the day (simplified logic)
          const allUncompleted = prev.every(act => !act.completed);
          if (allUncompleted) setStreak(s => s + 1);
        }
        return { ...a, completed: !a.completed };
      }
      return a;
    }));
  };

  return (
    <FootprintContext.Provider value={{
      carbonData, setCarbonData, monthlyEmissions, actions, setActions, toggleActionCompleted, streak
    }}>
      {children}
    </FootprintContext.Provider>
  );
};

export const useFootprint = () => {
  const context = useContext(FootprintContext);
  if (context === undefined) {
    throw new Error('useFootprint must be used within a FootprintProvider');
  }
  return context;
};

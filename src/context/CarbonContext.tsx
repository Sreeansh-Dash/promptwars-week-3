"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CarbonData, ActionItem, Badge, FootprintHistory } from '../types';
import { calculateMonthlyCarbon } from '../utils/carbonEngine';

interface CarbonContextType {
  carbonData: CarbonData;
  setCarbonData: React.Dispatch<React.SetStateAction<CarbonData>>;
  monthlyEmissions: ReturnType<typeof calculateMonthlyCarbon>;
  actions: ActionItem[];
  setActions: React.Dispatch<React.SetStateAction<ActionItem[]>>;
  toggleActionCompleted: (id: string) => void;
  streak: number;
  badges: Badge[];
  history: FootprintHistory[];
  isMounted: boolean;
  saveDataToLocal: () => void;
}

const defaultCarbonData: CarbonData = {
  transportation: { kmPerDay: 10, vehicleType: 'car' },
  homeEnergy: { electricityKwhPerMonth: 200, heatingType: 'gas' },
  diet: 'average',
  waste: 'average',
};

const defaultActions: ActionItem[] = [
  { id: '1', title: 'Start your journey', description: 'Log your first footprint!', co2SavedKg: 0, completed: false }
];

const CarbonContext = createContext<CarbonContextType | undefined>(undefined);

export const CarbonProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);

  const [carbonData, setCarbonData] = useState<CarbonData>(defaultCarbonData);
  const [actions, setActions] = useState<ActionItem[]>(defaultActions);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [history, setHistory] = useState<FootprintHistory[]>([]);

  // Hydration logic
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('ecoPulseData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.carbonData) setCarbonData(parsed.carbonData);
        if (parsed.actions) setActions(parsed.actions);
        if (parsed.streak !== undefined) setStreak(parsed.streak);
        if (parsed.badges) setBadges(parsed.badges);
        if (parsed.history) setHistory(parsed.history);
      }
    } catch (e) {
      console.error("Failed to parse local storage data", e);
    }
    setIsMounted(true);
  }, []);

  // Save changes to local storage explicitly
  const saveDataToLocal = () => {
    const totalKg = calculateMonthlyCarbon(carbonData).total;
    const newHistoryEntry = { date: new Date().toISOString(), totalKg };
    const updatedHistory = [...history, newHistoryEntry];
    setHistory(updatedHistory);
    
    // Simple badge gamification
    let updatedBadges = [...badges];
    if (streak >= 7 && !updatedBadges.find(b => b.id === 'week-streak')) {
      updatedBadges.push({ id: 'week-streak', name: '7-Day Eco Warrior', description: 'Maintained a streak for a week!', unlockedAt: new Date().toISOString() });
    }

    setBadges(updatedBadges);

    localStorage.setItem('ecoPulseData', JSON.stringify({
      carbonData,
      actions,
      streak,
      badges: updatedBadges,
      history: updatedHistory
    }));
  };

  // Sync basic actions toggles instantly
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('ecoPulseData', JSON.stringify({
        carbonData, actions, streak, badges, history
      }));
    }
  }, [actions, streak]); // Save actions/streak immediately when changed

  const monthlyEmissions = calculateMonthlyCarbon(carbonData);

  const toggleActionCompleted = (id: string) => {
    setActions(prev => prev.map(a => {
      if (a.id === id) {
        if (!a.completed) {
          const allUncompleted = prev.every(act => !act.completed);
          if (allUncompleted) setStreak(s => s + 1);
        }
        return { ...a, completed: !a.completed };
      }
      return a;
    }));
  };

  return (
    <CarbonContext.Provider value={{
      carbonData, setCarbonData, monthlyEmissions, actions, setActions, toggleActionCompleted, 
      streak, badges, history, isMounted, saveDataToLocal
    }}>
      {children}
    </CarbonContext.Provider>
  );
};

export const useCarbon = () => {
  const context = useContext(CarbonContext);
  if (context === undefined) {
    throw new Error('useCarbon must be used within a CarbonProvider');
  }
  return context;
};

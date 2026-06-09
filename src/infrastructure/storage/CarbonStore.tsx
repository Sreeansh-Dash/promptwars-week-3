"use client";

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { CarbonState } from '../../core/types/types';
import { carbonStateSchema } from '../../core/validation/validation';
import { carbonReducer, CarbonAction, defaultState } from './carbonReducer';

interface CarbonContextProps {
  state: CarbonState;
  dispatch: React.Dispatch<CarbonAction>;
  isHydrated: boolean;
}

const CarbonStoreContext = createContext<CarbonContextProps | undefined>(undefined);

export function CarbonStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(carbonReducer, defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ecoPulseData_v1');
      if (stored) {
        const rawJson = JSON.parse(stored);
        const result = carbonStateSchema.safeParse(rawJson);
        if (result.success) {
          dispatch({ type: 'HYDRATE', payload: result.data });
        } else {
          console.warn("Storage validation failed, resetting to defaults:", result.error);
          localStorage.removeItem('ecoPulseData_v1');
        }
      }
    } catch (e) {
      console.error("Error hydrating localStorage carbon store:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('ecoPulseData_v1', JSON.stringify(state));
    }
  }, [state, isHydrated]);

  return (
    <CarbonStoreContext.Provider value={{ state, dispatch, isHydrated }}>
      {children}
    </CarbonStoreContext.Provider>
  );
}

export function useCarbonStore() {
  const context = useContext(CarbonStoreContext);
  if (!context) {
    throw new Error('useCarbonStore must be used within a CarbonStoreProvider');
  }
  return context;
}

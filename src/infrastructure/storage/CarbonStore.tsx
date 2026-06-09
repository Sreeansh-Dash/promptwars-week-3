"use client";

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { CarbonState } from '../../core/types/types';
import { carbonStateSchema } from '../../core/validation/validation';
import { carbonReducer, CarbonAction, defaultState } from './carbonReducer';
import { StorageHydrationError } from '../../core/errors/errors';

/**
 * Context properties exposed by the CarbonStore.
 */
interface CarbonContextProps {
  state: CarbonState;
  dispatch: React.Dispatch<CarbonAction>;
  isHydrated: boolean;
  hasHydrationError: boolean;
  dismissHydrationError: () => void;
}

const CarbonStoreContext = createContext<CarbonContextProps | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ecoPulseData_v1';

/**
 * Store Provider wrapping the application. Orchestrates the local-first state lifecycle,
 * including local storage state hydration, Zod schema validation, and exception tracking.
 * 
 * @param props - Children components.
 */
export function CarbonStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(carbonReducer, defaultState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasHydrationError, setHasHydrationError] = useState(false);

  const dismissHydrationError = () => {
    setHasHydrationError(false);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        let rawJson: unknown;
        try {
          rawJson = JSON.parse(stored);
        } catch (jsonErr) {
          throw new StorageHydrationError("Corrupt storage payload (JSON syntax invalid)", jsonErr);
        }

        const result = carbonStateSchema.safeParse(rawJson);
        if (result.success) {
          dispatch({ type: 'HYDRATE', payload: result.data });
        } else {
          throw new StorageHydrationError("State validation failed against zod schema", result.error);
        }
      }
    } catch (e) {
      console.error("EcoPulse Storage Hydration Failed:", e);
      setHasHydrationError(true);
      // Clean up corrupt storage to prevent continuous hydration loops
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error("Failed to persist carbon state to localStorage:", err);
      }
    }
  }, [state, isHydrated]);

  return (
    <CarbonStoreContext.Provider value={{ state, dispatch, isHydrated, hasHydrationError, dismissHydrationError }}>
      {children}
    </CarbonStoreContext.Provider>
  );
}

/**
 * Custom hook to consume the CarbonState context.
 * Throws an exception if called outside a CarbonStoreProvider.
 * 
 * @returns The context properties including state, dispatch, hydration status, and hydration errors.
 */
export function useCarbonStore() {
  const context = useContext(CarbonStoreContext);
  if (!context) {
    throw new Error('useCarbonStore must be used within a CarbonStoreProvider');
  }
  return context;
}

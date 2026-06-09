"use client";

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { CarbonState, CarbonData, ActionItem, Badge, FootprintHistory, UserProfile } from '../../core/types/types';
import { carbonStateSchema } from '../../core/validation/validation';

const CURRENT_VERSION = 1;

const defaultCarbonData: CarbonData = {
  transportation: { kmPerDay: 0, vehicleType: 'gas' },
  homeEnergy: { electricityKwhPerMonth: 0, heatingType: 'coal' },
  diet: 'average',
  waste: 'average'
};

const defaultState: CarbonState = {
  version: CURRENT_VERSION,
  userProfile: {
    name: 'Guest',
    title: 'Eco Novice'
  },
  carbonData: defaultCarbonData,
  actions: [],
  streak: 0,
  badges: [],
  history: [],
  aiInsights: ''
};

type CarbonAction =
  | { type: 'HYDRATE'; payload: CarbonState }
  | { type: 'UPDATE_METRICS'; payload: Partial<CarbonData> }
  | { type: 'SET_ACTIONS'; payload: ActionItem[] }
  | { type: 'TOGGLE_ACTION'; payload: string }
  | { type: 'ADD_HISTORY'; payload: FootprintHistory }
  | { type: 'UNLOCK_BADGE'; payload: Badge }
  | { type: 'SET_STREAK'; payload: number }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }
  | { type: 'ADD_CUSTOM_ACTION'; payload: ActionItem }
  | { type: 'DELETE_ACTION'; payload: string }
  | { type: 'SET_AI_INSIGHTS'; payload: string }
  | { type: 'RESET' };

function carbonReducer(state: CarbonState, action: CarbonAction): CarbonState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...action.payload, version: CURRENT_VERSION };
    case 'UPDATE_METRICS':
      return {
        ...state,
        carbonData: {
          ...state.carbonData,
          ...action.payload
        }
      };
    case 'SET_ACTIONS':
      return { ...state, actions: action.payload };
    case 'TOGGLE_ACTION': {
      const updatedActions = state.actions.map(act => {
        if (act.id === action.payload) {
          return { ...act, completed: !act.completed };
        }
        return act;
      });
      return { ...state, actions: updatedActions };
    }
    case 'ADD_HISTORY': {
      const cleanHistory = state.history.filter(h => h.date !== action.payload.date);
      return { ...state, history: [...cleanHistory, action.payload] };
    }
    case 'UNLOCK_BADGE': {
      if (state.badges.some(b => b.id === action.payload.id)) {
        return state;
      }
      return { ...state, badges: [...state.badges, action.payload] };
    }
    case 'SET_STREAK':
      return { ...state, streak: action.payload };
    case 'UPDATE_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'ADD_CUSTOM_ACTION':
      return { ...state, actions: [action.payload, ...state.actions] };
    case 'DELETE_ACTION':
      return { ...state, actions: state.actions.filter(a => a.id !== action.payload) };
    case 'SET_AI_INSIGHTS':
      return { ...state, aiInsights: action.payload };
    case 'RESET':
      return defaultState;
    default:
      return state;
  }
}

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

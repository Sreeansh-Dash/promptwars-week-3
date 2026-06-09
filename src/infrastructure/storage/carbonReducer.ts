import { CarbonState, CarbonData, ActionItem, Badge, FootprintHistory, UserProfile } from '../../core/types/types';

export const CURRENT_VERSION = 1;

export const defaultCarbonData: CarbonData = {
  transportation: { kmPerDay: 0, vehicleType: 'gas' },
  homeEnergy: { electricityKwhPerMonth: 0, heatingType: 'coal' },
  diet: 'average',
  waste: 'average'
};

export const defaultState: CarbonState = {
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

export type CarbonAction =
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

export function carbonReducer(state: CarbonState, action: CarbonAction): CarbonState {
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

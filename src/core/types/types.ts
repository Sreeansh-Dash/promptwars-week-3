export interface CarbonData {
  transportation: {
    kmPerDay: number;
    vehicleType: 'ev' | 'transit' | 'cycle' | 'gas';
  };
  homeEnergy: {
    electricityKwhPerMonth: number;
    heatingType: 'coal' | 'renewable';
  };
  diet: 'meat-heavy' | 'average' | 'vegetarian' | 'vegan';
  waste: 'high' | 'average' | 'low';
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  co2SavedKg: number;
  completed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
}

export interface FootprintHistory {
  date: string; // ISO format
  totalKg: number;
}

export interface UserProfile {
  name: string;
  title: string;
}

export interface CarbonState {
  version: number;
  userProfile: UserProfile;
  carbonData: CarbonData;
  actions: ActionItem[];
  streak: number;
  badges: Badge[];
  history: FootprintHistory[];
  aiInsights?: string;
}

export interface GroqResponse {
  insights: Omit<ActionItem, 'completed' | 'id'>[];
}

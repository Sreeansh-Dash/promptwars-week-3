export interface CarbonData {
  transportation: {
    kmPerDay: number;
    vehicleType: 'car' | 'public' | 'bike' | 'walking';
  };
  homeEnergy: {
    electricityKwhPerMonth: number;
    heatingType: 'gas' | 'electric' | 'none';
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

export interface GroqResponse {
  insights: Omit<ActionItem, 'completed' | 'id'>[];
}

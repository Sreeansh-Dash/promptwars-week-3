import { CarbonData } from '../types';

// Constants for CO2 emissions in kg
const EMISSION_FACTORS = {
  transport: {
    car: 0.192, // kg CO2 per km
    public: 0.041,
    bike: 0,
    walking: 0,
  },
  energy: {
    electricity: 0.233, // kg CO2 per kWh
    heating: {
      gas: 150, // rough monthly estimate in kg
      electric: 50,
      none: 0,
    }
  },
  diet: {
    'meat-heavy': 250, // rough monthly estimate in kg
    'average': 170,
    'vegetarian': 100,
    'vegan': 70,
  },
  waste: {
    'high': 80,
    'average': 50,
    'low': 20,
  }
};

export const calculateMonthlyCarbon = (data: CarbonData) => {
  const transportMonthly = (data.transportation.kmPerDay * 30) * EMISSION_FACTORS.transport[data.transportation.vehicleType];
  const energyMonthly = (data.homeEnergy.electricityKwhPerMonth * EMISSION_FACTORS.energy.electricity) + EMISSION_FACTORS.energy.heating[data.homeEnergy.heatingType];
  const dietMonthly = EMISSION_FACTORS.diet[data.diet];
  const wasteMonthly = EMISSION_FACTORS.waste[data.waste];

  return {
    transport: transportMonthly,
    energy: energyMonthly,
    diet: dietMonthly,
    waste: wasteMonthly,
    total: transportMonthly + energyMonthly + dietMonthly + wasteMonthly
  };
};

export const GLOBAL_AVERAGE_MONTHLY_KG = 400; // Example global average

import { CarbonData } from '../types/types';

export const EMISSION_FACTORS = {
  transport: {
    ev: 0.05,      // kg CO2 per km
    transit: 0.03, // kg CO2 per km
    cycle: 0.0,    // kg CO2 per km
    gas: 0.18      // kg CO2 per km
  },
  energy: {
    coal: 0.4,       // kg CO2 per kWh
    renewable: 0.05  // kg CO2 per kWh
  },
  diet: {
    'meat-heavy': 7.0, // kg CO2 per day
    'average': 4.0,    // kg CO2 per day
    'vegetarian': 2.0, // kg CO2 per day
    'vegan': 1.5       // kg CO2 per day
  },
  waste: {
    high: 15.0,     // kg CO2 per week
    average: 8.0,   // kg CO2 per week
    low: 3.0        // kg CO2 per week
  }
};

/**
 * Calculates monthly carbon emissions in kg CO2 for transport, energy, diet, and waste.
 */
export const calculateMonthlyCarbon = (data: CarbonData) => {
  const transportMonthly = (data.transportation.kmPerDay * 30) * EMISSION_FACTORS.transport[data.transportation.vehicleType];
  const energyMonthly = data.homeEnergy.electricityKwhPerMonth * EMISSION_FACTORS.energy[data.homeEnergy.heatingType];
  const dietMonthly = EMISSION_FACTORS.diet[data.diet] * 30;
  const wasteMonthly = EMISSION_FACTORS.waste[data.waste] * 4.33;

  return {
    transport: Math.round(transportMonthly * 100) / 100,
    energy: Math.round(energyMonthly * 100) / 100,
    diet: Math.round(dietMonthly * 100) / 100,
    waste: Math.round(wasteMonthly * 100) / 100,
    total: Math.round((transportMonthly + energyMonthly + dietMonthly + wasteMonthly) * 100) / 100
  };
};

export const GLOBAL_AVERAGE_MONTHLY_KG = 400;

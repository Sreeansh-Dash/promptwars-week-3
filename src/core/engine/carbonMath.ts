import { CarbonData } from '../types/types';

/**
 * Standard emission factors representing kg CO2 produced per unit of resource consumed.
 */
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
 * Magic numbers extracted as semantic constants.
 */
export const DAYS_IN_MONTH = 30;
export const WEEKS_IN_MONTH = 4.33;
export const ROUNDING_MULTIPLIER_TWO_DECIMALS = 100;
export const GLOBAL_AVERAGE_MONTHLY_KG = 400;

/**
 * Rounds a floating point number to at most two decimal places.
 * This is a pure utility function.
 * 
 * @param value - The raw float value.
 * @returns The value rounded to two decimal places.
 */
const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * ROUNDING_MULTIPLIER_TWO_DECIMALS) / ROUNDING_MULTIPLIER_TWO_DECIMALS;
};

/**
 * Calculates monthly carbon emissions in kg CO2 for transport, energy, diet, and waste.
 * This is a pure mathematical calculation function.
 * 
 * @param data - The validated user carbon metrics structure.
 * @returns An object containing rounded monthly emissions by category and the overall total.
 */
export const calculateMonthlyCarbon = (data: CarbonData) => {
  const transportMonthly = (data.transportation.kmPerDay * DAYS_IN_MONTH) * EMISSION_FACTORS.transport[data.transportation.vehicleType];
  const energyMonthly = data.homeEnergy.electricityKwhPerMonth * EMISSION_FACTORS.energy[data.homeEnergy.heatingType];
  const dietMonthly = EMISSION_FACTORS.diet[data.diet] * DAYS_IN_MONTH;
  const wasteMonthly = EMISSION_FACTORS.waste[data.waste] * WEEKS_IN_MONTH;

  return {
    transport: roundToTwoDecimals(transportMonthly),
    energy: roundToTwoDecimals(energyMonthly),
    diet: roundToTwoDecimals(dietMonthly),
    waste: roundToTwoDecimals(wasteMonthly),
    total: roundToTwoDecimals(transportMonthly + energyMonthly + dietMonthly + wasteMonthly)
  };
};

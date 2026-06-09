import { calculateMonthlyCarbon } from './carbonMath';
import { CarbonData } from '../types/types';

describe('Carbon Calculation Engine Tests', () => {
  // Case 1: Standard Gas Car Commuter
  test('Case 1: Standard Gas Car Commuter profile', () => {
    const data: CarbonData = {
      transportation: { kmPerDay: 20, vehicleType: 'gas' },
      homeEnergy: { electricityKwhPerMonth: 300, heatingType: 'coal' },
      diet: 'average',
      waste: 'average'
    };

    const emissions = calculateMonthlyCarbon(data);

    expect(emissions.transport).toBe(108); // 20 * 30 * 0.18
    expect(emissions.energy).toBe(120);    // 300 * 0.4
    expect(emissions.diet).toBe(120);      // 4.0 * 30
    expect(emissions.waste).toBe(34.64);   // 8.0 * 4.33 = 34.64
    expect(emissions.total).toBe(382.64);  // 108 + 120 + 120 + 34.64
  });

  // Case 2: Eco Warrior
  test('Case 2: Eco Warrior (EV, Renewable, Vegan, Low Waste) profile', () => {
    const data: CarbonData = {
      transportation: { kmPerDay: 10, vehicleType: 'ev' },
      homeEnergy: { electricityKwhPerMonth: 150, heatingType: 'renewable' },
      diet: 'vegan',
      waste: 'low'
    };

    const emissions = calculateMonthlyCarbon(data);

    expect(emissions.transport).toBe(15);   // 10 * 30 * 0.05
    expect(emissions.energy).toBe(7.5);     // 150 * 0.05
    expect(emissions.diet).toBe(45);        // 1.5 * 30
    expect(emissions.waste).toBe(12.99);    // 3.0 * 4.33 = 12.99
    expect(emissions.total).toBe(80.49);    // 15 + 7.5 + 45 + 12.99
  });

  // Case 3: Public Transit Commuter
  test('Case 3: Public Transit Commuter profile', () => {
    const data: CarbonData = {
      transportation: { kmPerDay: 50, vehicleType: 'transit' },
      homeEnergy: { electricityKwhPerMonth: 200, heatingType: 'coal' },
      diet: 'vegetarian',
      waste: 'high'
    };

    const emissions = calculateMonthlyCarbon(data);

    expect(emissions.transport).toBe(45);     // 50 * 30 * 0.03
    expect(emissions.energy).toBe(80);        // 200 * 0.4
    expect(emissions.diet).toBe(60);        // 2.0 * 30
    expect(emissions.waste).toBe(64.95);     // 15.0 * 4.33 = 64.95
    expect(emissions.total).toBe(249.95);    // 45 + 80 + 60 + 64.95
  });

  // Case 4: Active Cyclist
  test('Case 4: Active Cyclist (Cycle, Renewable, Average Diet, Low Waste) profile', () => {
    const data: CarbonData = {
      transportation: { kmPerDay: 15, vehicleType: 'cycle' },
      homeEnergy: { electricityKwhPerMonth: 100, heatingType: 'renewable' },
      diet: 'average',
      waste: 'low'
    };

    const emissions = calculateMonthlyCarbon(data);

    expect(emissions.transport).toBe(0);     // 15 * 30 * 0
    expect(emissions.energy).toBe(5);        // 100 * 0.05
    expect(emissions.diet).toBe(120);      // 4.0 * 30
    expect(emissions.waste).toBe(12.99);     // 3.0 * 4.33
    expect(emissions.total).toBe(137.99);    // 0 + 5 + 120 + 12.99
  });

  // Case 5: High Carbon Consumer
  test('Case 5: High Carbon Consumer profile', () => {
    const data: CarbonData = {
      transportation: { kmPerDay: 100, vehicleType: 'gas' },
      homeEnergy: { electricityKwhPerMonth: 1000, heatingType: 'coal' },
      diet: 'meat-heavy',
      waste: 'high'
    };

    const emissions = calculateMonthlyCarbon(data);

    expect(emissions.transport).toBe(540);     // 100 * 30 * 0.18
    expect(emissions.energy).toBe(400);       // 1000 * 0.4
    expect(emissions.diet).toBe(210);       // 7.0 * 30
    expect(emissions.waste).toBe(64.95);     // 15.0 * 4.33
    expect(emissions.total).toBe(1214.95);   // 540 + 400 + 210 + 64.95
  });
});

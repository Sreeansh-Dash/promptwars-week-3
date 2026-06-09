import {
  transportationSchema,
  homeEnergySchema,
  dietSchema,
  wasteSchema,
  carbonDataSchema,
  userProfileSchema,
  carbonStateSchema
} from './validation';

describe('Zod Validation Schema Tests', () => {
  describe('Transportation Schema', () => {
    test('passes on valid transportation input', () => {
      const valid = { kmPerDay: 45, vehicleType: 'transit' };
      const parsed = transportationSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    test('fails on negative kmPerDay', () => {
      const invalid = { kmPerDay: -10, vehicleType: 'ev' };
      const parsed = transportationSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    test('fails on invalid vehicleType', () => {
      const invalid = { kmPerDay: 20, vehicleType: 'rocket' };
      const parsed = transportationSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('Home Energy Schema', () => {
    test('passes on valid home energy input', () => {
      const valid = { electricityKwhPerMonth: 250, heatingType: 'renewable' };
      const parsed = homeEnergySchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    test('fails on invalid heating type', () => {
      const invalid = { electricityKwhPerMonth: 100, heatingType: 'natural-gas' };
      const parsed = homeEnergySchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('Diet & Waste Schema', () => {
    test('passes on valid enum values', () => {
      expect(dietSchema.safeParse('vegan').success).toBe(true);
      expect(dietSchema.safeParse('vegetarian').success).toBe(true);
      expect(wasteSchema.safeParse('low').success).toBe(true);
      expect(wasteSchema.safeParse('high').success).toBe(true);
    });

    test('fails on invalid values', () => {
      expect(dietSchema.safeParse('junk-food').success).toBe(false);
      expect(wasteSchema.safeParse('zero').success).toBe(false);
    });
  });

  describe('Carbon Data Schema', () => {
    test('passes on valid complete carbon data', () => {
      const data = {
        transportation: { kmPerDay: 20, vehicleType: 'cycle' as const },
        homeEnergy: { electricityKwhPerMonth: 100, heatingType: 'renewable' as const },
        diet: 'vegetarian' as const,
        waste: 'low' as const
      };
      const parsed = carbonDataSchema.safeParse(data);
      expect(parsed.success).toBe(true);
    });

    test('fails on missing properties', () => {
      const invalid = {
        transportation: { kmPerDay: 20, vehicleType: 'cycle' as const }
      };
      const parsed = carbonDataSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('User Profile Schema', () => {
    test('passes on valid user profile', () => {
      const valid = { name: 'Sreeansh', title: 'Carbon Master' };
      const parsed = userProfileSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    test('fails on empty name', () => {
      const invalid = { name: '', title: 'Eco Hero' };
      const parsed = userProfileSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('Global Carbon State Schema', () => {
    test('passes on valid complete state', () => {
      const validState = {
        version: 1,
        userProfile: { name: 'Alex', title: 'Impact Guardian' },
        carbonData: {
          transportation: { kmPerDay: 20, vehicleType: 'cycle' },
          homeEnergy: { electricityKwhPerMonth: 100, heatingType: 'renewable' },
          diet: 'vegetarian',
          waste: 'low'
        },
        actions: [
          { id: '1', title: 'Composting', description: 'Compost organic waste', co2SavedKg: 5, completed: false }
        ],
        streak: 3,
        badges: [
          { id: 'zero-waste', name: 'Zero Waste', description: 'Unlocked zero waste', unlockedAt: '2026-06-09' }
        ],
        history: [
          { date: '2026-06-09', totalKg: 150 }
        ],
        aiInsights: 'Everything looks optimal.'
      };
      const parsed = carbonStateSchema.safeParse(validState);
      expect(parsed.success).toBe(true);
    });
  });
});

import { z } from 'zod';

export const transportationSchema = z.object({
  kmPerDay: z.number().min(0).max(1000),
  vehicleType: z.enum(['ev', 'transit', 'cycle', 'gas'])
});

export const homeEnergySchema = z.object({
  electricityKwhPerMonth: z.number().min(0).max(5000),
  heatingType: z.enum(['coal', 'renewable'])
});

export const dietSchema = z.enum(['meat-heavy', 'average', 'vegetarian', 'vegan']);

export const wasteSchema = z.enum(['high', 'average', 'low']);

export const carbonDataSchema = z.object({
  transportation: transportationSchema,
  homeEnergy: homeEnergySchema,
  diet: dietSchema,
  waste: wasteSchema
});

export const actionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  co2SavedKg: z.number(),
  completed: z.boolean()
});

export const badgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  unlockedAt: z.string()
});

export const footprintHistorySchema = z.object({
  date: z.string(),
  totalKg: z.number()
});

export const userProfileSchema = z.object({
  name: z.string().min(1).max(50),
  title: z.string().min(1).max(50)
});

export const carbonStateSchema = z.object({
  version: z.number(),
  userProfile: userProfileSchema,
  carbonData: carbonDataSchema,
  actions: z.array(actionItemSchema),
  streak: z.number(),
  badges: z.array(badgeSchema),
  history: z.array(footprintHistorySchema),
  aiInsights: z.string().optional()
});

export type ValidatedCarbonData = z.infer<typeof carbonDataSchema>;
export type ValidatedCarbonState = z.infer<typeof carbonStateSchema>;

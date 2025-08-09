import { z } from 'zod';

export const createMealEntrySchema = z.object({
  cycleId: z.string().min(1, 'Cycle ID is required'),
  date: z.string().min(1, 'Date is required'),
  userId: z.string().min(1, 'User ID is required'),
  lunch: z.number().int().min(0).max(1, 'Lunch must be 0 or 1'),
  dinner: z.number().int().min(0).max(1, 'Dinner must be 0 or 1'),
  guestMeals: z.number().int().min(0, 'Guest meals cannot be negative'),
  note: z.string().optional(),
});

export const updateMealEntrySchema = z.object({
  lunch: z.number().int().min(0).max(1, 'Lunch must be 0 or 1').optional(),
  dinner: z.number().int().min(0).max(1, 'Dinner must be 0 or 1').optional(),
  guestMeals: z.number().int().min(0, 'Guest meals cannot be negative').optional(),
  note: z.string().optional(),
});

export const bulkMealEntrySchema = z.object({
  cycleId: z.string().min(1, 'Cycle ID is required'),
  date: z.string().min(1, 'Date is required'),
  meals: z.array(z.object({
    userId: z.string().min(1, 'User ID is required'),
    lunch: z.number().int().min(0).max(1, 'Lunch must be 0 or 1'),
    dinner: z.number().int().min(0).max(1, 'Dinner must be 0 or 1'),
    guestMeals: z.number().int().min(0, 'Guest meals cannot be negative'),
  })),
});

export type CreateMealEntryInput = z.infer<typeof createMealEntrySchema>;
export type UpdateMealEntryInput = z.infer<typeof updateMealEntrySchema>;
export type BulkMealEntryInput = z.infer<typeof bulkMealEntrySchema>;

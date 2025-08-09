import { z } from 'zod';

export const createCycleSchema = z.object({
  name: z.string().min(1, 'Cycle name is required'),
  month: z.number().int().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.number().int().min(2020).max(2050, 'Year must be between 2020 and 2050'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  }
);

export type CreateCycleInput = z.infer<typeof createCycleSchema>;

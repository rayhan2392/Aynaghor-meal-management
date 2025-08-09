import { z } from 'zod';
import { isValidAmount } from '@/utils/currency';

export const createDepositSchema = z.object({
  cycleId: z.string().min(1, 'Cycle ID is required'),
  userId: z.string().min(1, 'User must be selected'),
  date: z.string().min(1, 'Date is required'),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine(isValidAmount, 'Amount must be a positive number'),
  note: z.string().optional(),
});

export const updateDepositSchema = z.object({
  userId: z.string().min(1, 'User must be selected').optional(),
  date: z.string().min(1, 'Date is required').optional(),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine(isValidAmount, 'Amount must be a positive number')
    .optional(),
  note: z.string().optional(),
});

export type CreateDepositInput = z.infer<typeof createDepositSchema>;
export type UpdateDepositInput = z.infer<typeof updateDepositSchema>;

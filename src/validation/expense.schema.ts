import { z } from 'zod';
import { isValidAmount } from '@/utils/currency';

export const createExpenseSchema = z.object({
  cycleId: z.string().min(1, 'Cycle ID is required'),
  date: z.string().min(1, 'Date is required'),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine(isValidAmount, 'Amount must be a positive number'),
  paidFrom: z.enum(['pool', 'personal'], {
    required_error: 'Payment source is required',
  }),
  payerUserId: z.string().optional(),
  note: z.string().optional(),
}).refine(
  (data) => {
    // If paidFrom is 'personal', payerUserId is required
    if (data.paidFrom === 'personal') {
      return data.payerUserId && data.payerUserId.length > 0;
    }
    return true;
  },
  {
    message: 'Payer must be selected when payment is made personally',
    path: ['payerUserId'],
  }
);

export const updateExpenseSchema = z.object({
  date: z.string().min(1, 'Date is required').optional(),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine(isValidAmount, 'Amount must be a positive number')
    .optional(),
  paidFrom: z.enum(['pool', 'personal']).optional(),
  payerUserId: z.string().optional(),
  note: z.string().optional(),
}).refine(
  (data) => {
    // If paidFrom is 'personal', payerUserId is required
    if (data.paidFrom === 'personal') {
      return data.payerUserId && data.payerUserId.length > 0;
    }
    return true;
  },
  {
    message: 'Payer must be selected when payment is made personally',
    path: ['payerUserId'],
  }
);

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

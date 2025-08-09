// Data Transfer Objects for API operations

import type { ObjectId } from './models';

// Deposit DTOs
export interface CreateDepositDTO {
  cycleId: ObjectId;
  userId: ObjectId;
  date: string;      // ISO string
  amount: string;    // money as string
  note?: string;
}

export interface UpdateDepositDTO {
  userId?: ObjectId;
  date?: string;
  amount?: string;
  note?: string;
}

// Expense DTOs
export interface CreateExpenseDTO {
  cycleId: ObjectId;
  date: string;      // ISO string
  amount: string;    // money as string
  paidFrom: 'pool' | 'personal';
  payerUserId?: ObjectId; // required if paidFrom='personal'
  note?: string;
}

export interface UpdateExpenseDTO {
  date?: string;
  amount?: string;
  paidFrom?: 'pool' | 'personal';
  payerUserId?: ObjectId;
  note?: string;
}

// Meal DTOs
export interface CreateMealEntryDTO {
  cycleId: ObjectId;
  date: string;      // ISO string
  userId: ObjectId;
  lunch: number;     // 0 | 1
  dinner: number;    // 0 | 1
  guestMeals: number; // >= 0
  note?: string;
}

export interface UpdateMealEntryDTO {
  lunch?: number;
  dinner?: number;
  guestMeals?: number;
  note?: string;
}

// Cycle DTOs
export interface CreateCycleDTO {
  name: string;
  month: number;     // 1-12
  year: number;      // 4-digit
  startDate: string; // ISO string
  endDate: string;   // ISO string (auto-calculated to end of month)
}

// Bulk meal entry for a specific date
export interface BulkMealEntryDTO {
  cycleId: ObjectId;
  date: string;      // ISO string
  meals: Array<{
    userId: ObjectId;
    lunch: number;
    dinner: number;
    guestMeals: number;
  }>;
}

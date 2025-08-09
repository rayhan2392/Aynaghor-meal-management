// Core data models aligned with future MongoDB/Mongoose schema

export type ObjectId = string;

export interface User {
  _id: ObjectId;
  name: string;
  role: 'manager' | 'member';
  active: boolean;
  createdAt: string; // ISO string
}

export interface Cycle {
  _id: ObjectId;
  name: string;        // e.g., "March 2025"
  month: number;       // 1-12
  year: number;        // 4-digit year
  startDate: string;   // ISO string (Dhaka timezone boundary)
  endDate: string;     // ISO string (end of month, Dhaka timezone)
  status: 'open' | 'closed';
  createdAt: string;   // ISO string
}

export interface Deposit {
  _id: ObjectId;
  cycleId: ObjectId;
  userId: ObjectId;
  date: string;        // ISO string (day)
  amount: string;      // money as string for precision
  note?: string;
  createdAt: string;   // ISO string
}

export interface Expense {
  _id: ObjectId;
  cycleId: ObjectId;
  date: string;        // ISO string (day)
  amount: string;      // money as string for precision
  paidFrom: 'pool' | 'personal';
  payerUserId?: ObjectId; // required if paidFrom='personal'
  note?: string;
  createdAt: string;   // ISO string
}

export interface MealEntry {
  _id: ObjectId;
  cycleId: ObjectId;
  date: string;        // ISO string (day)
  userId: ObjectId;
  lunch: number;       // 0 | 1
  dinner: number;      // 0 | 1
  guestMeals: number;  // integer >= 0, counts under this user's meals
  note?: string;
  createdAt: string;   // ISO string
}

export interface CloseSummary {
  _id: ObjectId;
  cycleId: ObjectId;
  perMealRate: string;   // precise decimal as string
  totals: {
    totalDeposits: string;
    totalExpenses: string;
    totalMeals: number;
  };
  perUser: Array<{
    userId: ObjectId;
    meals: number;
    share: string;       // final rounded amount (whole BDT)
    deposited: string;
    net: string;         // deposited - share
  }>;
  closedAt: string;      // ISO string
}

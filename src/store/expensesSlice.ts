import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Expense {
    id: string;
    date: string;
    amount: number;
    paidFrom: 'pool' | 'personal';
    payerName?: string;
    purchasedBy: string;
    note: string;
}

interface ExpensesState {
    expenses: Expense[];
}

const initialState: ExpensesState = {
    expenses: [
        // Initial mock data
        {
            id: '1',
            date: '2025-01-08',
            amount: 800,
            paidFrom: 'pool',
            purchasedBy: 'Masud',
            note: 'Rice, vegetables, fish'
        },
        {
            id: '2',
            date: '2025-01-07',
            amount: 600,
            paidFrom: 'personal',
            payerName: 'Shawn',
            purchasedBy: 'Shawn',
            note: 'Meat and spices'
        }
    ],
};

const expensesSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {
        addExpense: (state, action: PayloadAction<Omit<Expense, 'id'>>) => {
            const newExpense: Expense = {
                ...action.payload,
                id: Date.now().toString(),
            };
            state.expenses.unshift(newExpense); // Add to beginning
        },
        deleteExpense: (state, action: PayloadAction<string>) => {
            state.expenses = state.expenses.filter(expense => expense.id !== action.payload);
        },
    },
});

export const { addExpense, deleteExpense } = expensesSlice.actions;
export default expensesSlice.reducer;

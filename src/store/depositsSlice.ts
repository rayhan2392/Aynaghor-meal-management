import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Deposit {
    id: string;
    date: string;
    userId: string;
    userName: string;
    amount: number;
    note: string;
}

interface DepositsState {
    deposits: Deposit[];
}

const initialState: DepositsState = {
    deposits: [
        // Initial mock data
        {
            id: '1',
            date: '2025-01-08',
            userId: '1',
            userName: 'Shawn',
            amount: 3000,
            note: 'Monthly contribution'
        },
        {
            id: '2',
            date: '2025-01-08',
            userId: '2',
            userName: 'Sadi',
            amount: 3000,
            note: 'Monthly contribution'
        },
        {
            id: '3',
            date: '2025-01-05',
            userId: '3',
            userName: 'Masud',
            amount: 2500,
            note: 'Partial payment'
        }
    ],
};

const depositsSlice = createSlice({
    name: 'deposits',
    initialState,
    reducers: {
        addDeposit: (state, action: PayloadAction<Omit<Deposit, 'id'>>) => {
            const newDeposit: Deposit = {
                ...action.payload,
                id: Date.now().toString(),
            };
            state.deposits.unshift(newDeposit); // Add to beginning
        },
        deleteDeposit: (state, action: PayloadAction<string>) => {
            state.deposits = state.deposits.filter(deposit => deposit.id !== action.payload);
        },
    },
});

export const { addDeposit, deleteDeposit } = depositsSlice.actions;
export default depositsSlice.reducer;

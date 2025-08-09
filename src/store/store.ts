import { configureStore } from '@reduxjs/toolkit';
import mealsReducer from './mealsSlice';
import expensesReducer from './expensesSlice';
import depositsReducer from './depositsSlice';

export const store = configureStore({
    reducer: {
        meals: mealsReducer,
        expenses: expensesReducer,
        deposits: depositsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
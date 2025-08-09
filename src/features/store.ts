import { configureStore } from '@reduxjs/toolkit';

// Import slices
import usersReducer from './users/users.slice';
import cyclesReducer from './cycles/cycles.slice';
import depositsReducer from './deposits/deposits.slice';
import expensesReducer from './expenses/expenses.slice';
import mealsReducer from './meals/meals.slice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    cycles: cyclesReducer,
    deposits: depositsReducer,
    expenses: expensesReducer,
    meals: mealsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { selectActiveUsers } from '../users/selectors';
import { computeInterimTotals } from '@/utils/settlement';

// Current cycle data
export const selectCurrentCycleId = (state: RootState) => state.cycles.currentCycleId;

export const selectCurrentCycle = createSelector(
  [(state: RootState) => state.cycles.entities, selectCurrentCycleId],
  (cyclesEntities, currentCycleId) => {
    return currentCycleId ? cyclesEntities[currentCycleId] || null : null;
  }
);

// Current cycle data selectors
export const selectCurrentCycleDeposits = createSelector(
  [(state: RootState) => state.deposits.entities, selectCurrentCycleId],
  (depositsEntities, currentCycleId) => {
    if (!currentCycleId) return [];
    return Object.values(depositsEntities).filter(deposit => deposit.cycleId === currentCycleId);
  }
);

export const selectCurrentCycleExpenses = createSelector(
  [(state: RootState) => state.expenses.entities, selectCurrentCycleId],
  (expensesEntities, currentCycleId) => {
    if (!currentCycleId) return [];
    return Object.values(expensesEntities).filter(expense => expense.cycleId === currentCycleId);
  }
);

export const selectCurrentCycleMeals = createSelector(
  [(state: RootState) => state.meals.entities, selectCurrentCycleId],
  (mealsEntities, currentCycleId) => {
    if (!currentCycleId) return [];
    return Object.values(mealsEntities).filter(meal => meal.cycleId === currentCycleId);
  }
);

// Dashboard statistics
export const selectDashboardStats = createSelector(
  [
    selectActiveUsers,
    selectCurrentCycleDeposits,
    selectCurrentCycleExpenses,
    selectCurrentCycleMeals,
  ],
  (users, deposits, expenses, meals) => {
    return computeInterimTotals(users, deposits, expenses, meals);
  }
);

// Loading states
export const selectDashboardLoading = createSelector(
  [
    (state: RootState) => state.users.status,
    (state: RootState) => state.cycles.status,
    (state: RootState) => state.deposits.status,
    (state: RootState) => state.expenses.status,
    (state: RootState) => state.meals.status,
  ],
  (usersStatus, cyclesStatus, depositsStatus, expensesStatus, mealsStatus) => {
    return [usersStatus, cyclesStatus, depositsStatus, expensesStatus, mealsStatus].some(
      status => status === 'loading'
    );
  }
);

// Errors
export const selectDashboardErrors = createSelector(
  [
    (state: RootState) => state.users.error,
    (state: RootState) => state.cycles.error,
    (state: RootState) => state.deposits.error,
    (state: RootState) => state.expenses.error,
    (state: RootState) => state.meals.error,
  ],
  (usersError, cyclesError, depositsError, expensesError, mealsError) => {
    return [usersError, cyclesError, depositsError, expensesError, mealsError]
      .filter(Boolean);
  }
);

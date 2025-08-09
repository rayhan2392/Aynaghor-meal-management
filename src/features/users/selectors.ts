import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Basic selectors
export const selectUsersState = (state: RootState) => state.users;
export const selectUsersStatus = (state: RootState) => state.users.status;
export const selectUsersError = (state: RootState) => state.users.error;

// Entity selectors
export const selectAllUsers = createSelector(
  [selectUsersState],
  (usersState) => usersState.ids.map(id => usersState.entities[id])
);

export const selectUserById = (userId: string) => createSelector(
  [selectUsersState],
  (usersState) => usersState.entities[userId] || null
);

// Specific user type selectors
export const selectManager = createSelector(
  [selectAllUsers],
  (users) => users.find(user => user.role === 'manager') || null
);

export const selectActiveMembers = createSelector(
  [selectAllUsers],
  (users) => users.filter(user => user.active && user.role === 'member')
);

export const selectActiveUsers = createSelector(
  [selectAllUsers],
  (users) => users.filter(user => user.active)
);

// Loading state selectors
export const selectUsersLoading = createSelector(
  [selectUsersStatus],
  (status) => status === 'loading'
);

export const selectUsersLoaded = createSelector(
  [selectUsersStatus],
  (status) => status === 'succeeded'
);

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/models';
import * as usersAPI from '@/services/api/users';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    return await usersAPI.listUsers();
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, updates }: { id: string; updates: Partial<Pick<User, 'name' | 'role' | 'active'>> }) => {
    const updated = await usersAPI.updateUser(id, updates);
    if (!updated) {
      throw new Error('User not found');
    }
    return updated;
  }
);

// State interface
interface UsersState {
  entities: Record<string, User>;
  ids: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: UsersState = {
  entities: {},
  ids: [],
  status: 'idle',
  error: null,
};

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.status = 'succeeded';
        state.entities = {};
        state.ids = [];

        action.payload.forEach(user => {
          state.entities[user._id] = user;
          state.ids.push(user._id);
        });
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch users';
      })

      // Update user
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const user = action.payload;
        state.entities[user._id] = user;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update user';
      });
  },
});

export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;

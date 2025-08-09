import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Deposit } from '@/types/models';
import type { CreateDepositDTO, UpdateDepositDTO } from '@/types/dto';
import * as depositsAPI from '@/services/api/deposits';

// Async thunks
export const fetchDeposits = createAsyncThunk(
  'deposits/fetchDeposits',
  async (cycleId: string) => {
    return await depositsAPI.listDeposits(cycleId);
  }
);

export const createDeposit = createAsyncThunk(
  'deposits/createDeposit',
  async (data: CreateDepositDTO) => {
    return await depositsAPI.createDeposit(data);
  }
);

export const updateDeposit = createAsyncThunk(
  'deposits/updateDeposit',
  async ({ id, data }: { id: string; data: UpdateDepositDTO }) => {
    const updated = await depositsAPI.updateDeposit(id, data);
    if (!updated) {
      throw new Error('Deposit not found');
    }
    return updated;
  }
);

export const deleteDeposit = createAsyncThunk(
  'deposits/deleteDeposit',
  async (id: string) => {
    await depositsAPI.deleteDeposit(id);
    return id;
  }
);

// State interface
interface DepositsState {
  entities: Record<string, Deposit>;
  ids: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: DepositsState = {
  entities: {},
  ids: [],
  status: 'idle',
  error: null,
};

// Slice
const depositsSlice = createSlice({
  name: 'deposits',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDeposits: (state) => {
      state.entities = {};
      state.ids = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch deposits
      .addCase(fetchDeposits.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDeposits.fulfilled, (state, action: PayloadAction<Deposit[]>) => {
        state.status = 'succeeded';
        state.entities = {};
        state.ids = [];

        action.payload.forEach(deposit => {
          state.entities[deposit._id] = deposit;
          state.ids.push(deposit._id);
        });
      })
      .addCase(fetchDeposits.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch deposits';
      })

      // Create deposit
      .addCase(createDeposit.fulfilled, (state, action: PayloadAction<Deposit>) => {
        const deposit = action.payload;
        state.entities[deposit._id] = deposit;
        state.ids.push(deposit._id);
      })
      .addCase(createDeposit.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create deposit';
      })

      // Update deposit
      .addCase(updateDeposit.fulfilled, (state, action: PayloadAction<Deposit>) => {
        const deposit = action.payload;
        state.entities[deposit._id] = deposit;
      })
      .addCase(updateDeposit.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update deposit';
      })

      // Delete deposit
      .addCase(deleteDeposit.fulfilled, (state, action: PayloadAction<string>) => {
        const id = action.payload;
        delete state.entities[id];
        state.ids = state.ids.filter(existingId => existingId !== id);
      })
      .addCase(deleteDeposit.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete deposit';
      });
  },
});

export const { clearError, clearDeposits } = depositsSlice.actions;
export default depositsSlice.reducer;

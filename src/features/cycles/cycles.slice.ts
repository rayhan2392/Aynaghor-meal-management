import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Cycle } from '@/types/models';
import type { CreateCycleDTO } from '@/types/dto';
import * as cyclesAPI from '@/services/api/cycles';

// Async thunks
export const fetchCycles = createAsyncThunk(
  'cycles/fetchCycles',
  async () => {
    return await cyclesAPI.listCycles();
  }
);

export const fetchCurrentCycle = createAsyncThunk(
  'cycles/fetchCurrentCycle',
  async () => {
    return await cyclesAPI.getCurrentCycle();
  }
);

export const createCycle = createAsyncThunk(
  'cycles/createCycle',
  async (data: CreateCycleDTO) => {
    return await cyclesAPI.createCycle(data);
  }
);

export const closeCycle = createAsyncThunk(
  'cycles/closeCycle',
  async (id: string) => {
    const updated = await cyclesAPI.closeCycle(id);
    if (!updated) {
      throw new Error('Cycle not found');
    }
    return updated;
  }
);

export const reopenCycle = createAsyncThunk(
  'cycles/reopenCycle',
  async (id: string) => {
    const updated = await cyclesAPI.reopenCycle(id);
    if (!updated) {
      throw new Error('Cycle not found');
    }
    return updated;
  }
);

// State interface
interface CyclesState {
  entities: Record<string, Cycle>;
  ids: string[];
  currentCycleId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: CyclesState = {
  entities: {},
  ids: [],
  currentCycleId: null,
  status: 'idle',
  error: null,
};

// Slice
const cyclesSlice = createSlice({
  name: 'cycles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCycle: (state, action: PayloadAction<string>) => {
      state.currentCycleId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cycles
      .addCase(fetchCycles.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCycles.fulfilled, (state, action: PayloadAction<Cycle[]>) => {
        state.status = 'succeeded';
        state.entities = {};
        state.ids = [];

        action.payload.forEach(cycle => {
          state.entities[cycle._id] = cycle;
          state.ids.push(cycle._id);
        });
      })
      .addCase(fetchCycles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch cycles';
      })

      // Fetch current cycle
      .addCase(fetchCurrentCycle.fulfilled, (state, action: PayloadAction<Cycle | null>) => {
        if (action.payload) {
          state.currentCycleId = action.payload._id;
          state.entities[action.payload._id] = action.payload;
          if (!state.ids.includes(action.payload._id)) {
            state.ids.push(action.payload._id);
          }
        } else {
          state.currentCycleId = null;
        }
      })

      // Create cycle
      .addCase(createCycle.fulfilled, (state, action: PayloadAction<Cycle>) => {
        const cycle = action.payload;
        state.entities[cycle._id] = cycle;
        if (!state.ids.includes(cycle._id)) {
          state.ids.push(cycle._id);
        }
        state.currentCycleId = cycle._id;
      })
      .addCase(createCycle.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create cycle';
      })

      // Close cycle
      .addCase(closeCycle.fulfilled, (state, action: PayloadAction<Cycle>) => {
        const cycle = action.payload;
        state.entities[cycle._id] = cycle;
      })

      // Reopen cycle
      .addCase(reopenCycle.fulfilled, (state, action: PayloadAction<Cycle>) => {
        const cycle = action.payload;
        state.entities[cycle._id] = cycle;
        state.currentCycleId = cycle._id;
      });
  },
});

export const { clearError, setCurrentCycle } = cyclesSlice.actions;
export default cyclesSlice.reducer;

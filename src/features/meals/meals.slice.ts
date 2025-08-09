import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { MealEntry } from '@/types/models';
import type { CreateMealEntryDTO, UpdateMealEntryDTO, BulkMealEntryDTO } from '@/types/dto';
import * as mealsAPI from '@/services/api/meals';

// Async thunks
export const fetchMealEntries = createAsyncThunk(
  'meals/fetchMealEntries',
  async (cycleId: string) => {
    return await mealsAPI.listMealEntries(cycleId);
  }
);

export const createMealEntry = createAsyncThunk(
  'meals/createMealEntry',
  async (data: CreateMealEntryDTO) => {
    return await mealsAPI.upsertMealEntry(data);
  }
);

export const updateMealEntry = createAsyncThunk(
  'meals/updateMealEntry',
  async ({ id, data }: { id: string; data: UpdateMealEntryDTO }) => {
    const updated = await mealsAPI.updateMealEntry(id, data);
    if (!updated) {
      throw new Error('Meal entry not found');
    }
    return updated;
  }
);

export const deleteMealEntry = createAsyncThunk(
  'meals/deleteMealEntry',
  async (id: string) => {
    await mealsAPI.deleteMealEntry(id);
    return id;
  }
);

export const bulkUpsertMealEntries = createAsyncThunk(
  'meals/bulkUpsertMealEntries',
  async (data: BulkMealEntryDTO) => {
    return await mealsAPI.bulkUpsertMealEntries(data);
  }
);

export const copyMealsFromPreviousDay = createAsyncThunk(
  'meals/copyMealsFromPreviousDay',
  async ({ cycleId, fromDate, toDate }: { cycleId: string; fromDate: string; toDate: string }) => {
    return await mealsAPI.copyMealsFromPreviousDay(cycleId, fromDate, toDate);
  }
);

// State interface
interface MealsState {
  entities: Record<string, MealEntry>;
  ids: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: MealsState = {
  entities: {},
  ids: [],
  status: 'idle',
  error: null,
};

// Slice
const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMeals: (state) => {
      state.entities = {};
      state.ids = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch meal entries
      .addCase(fetchMealEntries.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMealEntries.fulfilled, (state, action: PayloadAction<MealEntry[]>) => {
        state.status = 'succeeded';
        state.entities = {};
        state.ids = [];

        action.payload.forEach(meal => {
          state.entities[meal._id] = meal;
          state.ids.push(meal._id);
        });
      })
      .addCase(fetchMealEntries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch meal entries';
      })

      // Create/upsert meal entry
      .addCase(createMealEntry.fulfilled, (state, action: PayloadAction<MealEntry>) => {
        const meal = action.payload;
        state.entities[meal._id] = meal;
        if (!state.ids.includes(meal._id)) {
          state.ids.push(meal._id);
        }
      })
      .addCase(createMealEntry.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create meal entry';
      })

      // Update meal entry
      .addCase(updateMealEntry.fulfilled, (state, action: PayloadAction<MealEntry>) => {
        const meal = action.payload;
        state.entities[meal._id] = meal;
      })
      .addCase(updateMealEntry.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update meal entry';
      })

      // Delete meal entry
      .addCase(deleteMealEntry.fulfilled, (state, action: PayloadAction<string>) => {
        const id = action.payload;
        delete state.entities[id];
        state.ids = state.ids.filter(existingId => existingId !== id);
      })
      .addCase(deleteMealEntry.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete meal entry';
      })

      // Bulk upsert meal entries
      .addCase(bulkUpsertMealEntries.fulfilled, (state, action: PayloadAction<MealEntry[]>) => {
        action.payload.forEach(meal => {
          state.entities[meal._id] = meal;
          if (!state.ids.includes(meal._id)) {
            state.ids.push(meal._id);
          }
        });
      })
      .addCase(bulkUpsertMealEntries.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update meal entries';
      })

      // Copy meals from previous day
      .addCase(copyMealsFromPreviousDay.fulfilled, (state, action: PayloadAction<MealEntry[]>) => {
        action.payload.forEach(meal => {
          state.entities[meal._id] = meal;
          if (!state.ids.includes(meal._id)) {
            state.ids.push(meal._id);
          }
        });
      })
      .addCase(copyMealsFromPreviousDay.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to copy meals';
      });
  },
});

export const { clearError, clearMeals } = mealsSlice.actions;
export default mealsSlice.reducer;

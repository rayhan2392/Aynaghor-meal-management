import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Expense } from '@/types/models';
import type { CreateExpenseDTO, UpdateExpenseDTO } from '@/types/dto';
import * as expensesAPI from '@/services/api/expenses';

// Async thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (cycleId: string) => {
    return await expensesAPI.listExpenses(cycleId);
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (data: CreateExpenseDTO) => {
    return await expensesAPI.createExpense(data);
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, data }: { id: string; data: UpdateExpenseDTO }) => {
    const updated = await expensesAPI.updateExpense(id, data);
    if (!updated) {
      throw new Error('Expense not found');
    }
    return updated;
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string) => {
    await expensesAPI.deleteExpense(id);
    return id;
  }
);

// State interface
interface ExpensesState {
  entities: Record<string, Expense>;
  ids: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: ExpensesState = {
  entities: {},
  ids: [],
  status: 'idle',
  error: null,
};

// Slice
const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearExpenses: (state) => {
      state.entities = {};
      state.ids = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
        state.status = 'succeeded';
        state.entities = {};
        state.ids = [];

        action.payload.forEach(expense => {
          state.entities[expense._id] = expense;
          state.ids.push(expense._id);
        });
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch expenses';
      })

      // Create expense
      .addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        const expense = action.payload;
        state.entities[expense._id] = expense;
        state.ids.push(expense._id);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create expense';
      })

      // Update expense
      .addCase(updateExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        const expense = action.payload;
        state.entities[expense._id] = expense;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update expense';
      })

      // Delete expense
      .addCase(deleteExpense.fulfilled, (state, action: PayloadAction<string>) => {
        const id = action.payload;
        delete state.entities[id];
        state.ids = state.ids.filter(existingId => existingId !== id);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete expense';
      });
  },
});

export const { clearError, clearExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;

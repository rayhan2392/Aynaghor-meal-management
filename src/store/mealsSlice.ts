import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface MealData {
    [userId: string]: {
        lunch: boolean;
        dinner: boolean;
        guestMeals: number;
    };
}

interface MealsState {
    mealsByDate: Record<string, MealData>; // date -> user meals
}

const initialState: MealsState = {
    mealsByDate: {},
};

const mealsSlice = createSlice({
    name: 'meals',
    initialState,
    reducers: {
        saveMealsForDate: (state, action: PayloadAction<{ date: string; meals: MealData }>) => {
            state.mealsByDate[action.payload.date] = action.payload.meals;
        },
        updateMealForUser: (state, action: PayloadAction<{
            date: string;
            userId: string;
            mealType: 'lunch' | 'dinner';
            value: boolean;
        }>) => {
            const { date, userId, mealType, value } = action.payload;
            if (!state.mealsByDate[date]) {
                state.mealsByDate[date] = {};
            }
            if (!state.mealsByDate[date][userId]) {
                state.mealsByDate[date][userId] = { lunch: false, dinner: false, guestMeals: 0 };
            }
            state.mealsByDate[date][userId][mealType] = value;
        },
        updateGuestMeals: (state, action: PayloadAction<{
            date: string;
            userId: string;
            guestMeals: number;
        }>) => {
            const { date, userId, guestMeals } = action.payload;
            if (!state.mealsByDate[date]) {
                state.mealsByDate[date] = {};
            }
            if (!state.mealsByDate[date][userId]) {
                state.mealsByDate[date][userId] = { lunch: false, dinner: false, guestMeals: 0 };
            }
            state.mealsByDate[date][userId].guestMeals = guestMeals;
        },
    },
});

export const { saveMealsForDate, updateMealForUser, updateGuestMeals } = mealsSlice.actions;
export default mealsSlice.reducer;

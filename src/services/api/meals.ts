// Meals API service (mock implementation)

import type { MealEntry } from '@/types/models';
import type { CreateMealEntryDTO, UpdateMealEntryDTO, BulkMealEntryDTO } from '@/types/dto';
import { mockDB } from '@/services/mock/db';

// Simulate API delay
function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function listMealEntries(cycleId: string): Promise<MealEntry[]> {
  await delay();
  return mockDB.findWhere(mockDB.meals, meal => meal.cycleId === cycleId);
}

export async function getMealEntryById(id: string): Promise<MealEntry | null> {
  await delay();
  return mockDB.findById(mockDB.meals, id);
}

export async function createMealEntry(data: CreateMealEntryDTO): Promise<MealEntry> {
  await delay();

  // Check if meal entry already exists for this user and date
  const existing = mockDB.findWhere(mockDB.meals,
    meal => meal.cycleId === data.cycleId &&
      meal.userId === data.userId &&
      meal.date.startsWith(data.date.split('T')[0])
  );

  if (existing.length > 0) {
    throw new Error('Meal entry already exists for this user and date');
  }

  return mockDB.create(mockDB.meals, data);
}

export async function updateMealEntry(id: string, data: UpdateMealEntryDTO): Promise<MealEntry | null> {
  await delay();
  return mockDB.update(mockDB.meals, id, data);
}

export async function deleteMealEntry(id: string): Promise<void> {
  await delay();
  const deleted = mockDB.delete(mockDB.meals, id);
  if (!deleted) {
    throw new Error('Meal entry not found');
  }
}

// Get meal entry for specific user and date
export async function getMealEntry(cycleId: string, userId: string, date: string): Promise<MealEntry | null> {
  await delay();
  const entries = mockDB.findWhere(mockDB.meals,
    meal => meal.cycleId === cycleId &&
      meal.userId === userId &&
      meal.date.startsWith(date.split('T')[0])
  );
  return entries[0] || null;
}

// Get meals by date for all users
export async function getMealsByDate(cycleId: string, date: string): Promise<MealEntry[]> {
  await delay();
  return mockDB.findWhere(mockDB.meals,
    meal => meal.cycleId === cycleId && meal.date.startsWith(date.split('T')[0])
  );
}

// Create or update meal entry (upsert)
export async function upsertMealEntry(data: CreateMealEntryDTO): Promise<MealEntry> {
  await delay();

  const existing = await getMealEntry(data.cycleId, data.userId, data.date);

  if (existing) {
    const updated = await updateMealEntry(existing._id, {
      lunch: data.lunch,
      dinner: data.dinner,
      guestMeals: data.guestMeals,
      note: data.note,
    });
    if (!updated) {
      throw new Error('Failed to update meal entry');
    }
    return updated;
  } else {
    return await createMealEntry(data);
  }
}

// Bulk create/update meal entries for a date
export async function bulkUpsertMealEntries(data: BulkMealEntryDTO): Promise<MealEntry[]> {
  await delay();

  const results: MealEntry[] = [];

  for (const mealData of data.meals) {
    const entry = await upsertMealEntry({
      cycleId: data.cycleId,
      date: data.date,
      userId: mealData.userId,
      lunch: mealData.lunch,
      dinner: mealData.dinner,
      guestMeals: mealData.guestMeals,
    });
    results.push(entry);
  }

  return results;
}

// Get total meals by user for a cycle
export async function getTotalMealsByUser(cycleId: string): Promise<Record<string, number>> {
  await delay();
  const meals = await listMealEntries(cycleId);
  const totals: Record<string, number> = {};

  meals.forEach(meal => {
    const current = totals[meal.userId] || 0;
    totals[meal.userId] = current + meal.lunch + meal.dinner + meal.guestMeals;
  });

  return totals;
}

// Get total meals for a cycle
export async function getTotalMeals(cycleId: string): Promise<number> {
  await delay();
  const meals = await listMealEntries(cycleId);
  return meals.reduce((total, meal) => {
    return total + meal.lunch + meal.dinner + meal.guestMeals;
  }, 0);
}

// Copy meals from previous day
export async function copyMealsFromPreviousDay(cycleId: string, fromDate: string, toDate: string): Promise<MealEntry[]> {
  await delay();

  const previousMeals = await getMealsByDate(cycleId, fromDate);
  const results: MealEntry[] = [];

  for (const meal of previousMeals) {
    try {
      const newMeal = await upsertMealEntry({
        cycleId,
        date: toDate,
        userId: meal.userId,
        lunch: meal.lunch,
        dinner: meal.dinner,
        guestMeals: meal.guestMeals,
        note: 'Copied from previous day',
      });
      results.push(newMeal);
    } catch (error) {
      // Skip if already exists or other error
      console.warn('Failed to copy meal for user:', meal.userId, error);
    }
  }

  return results;
}

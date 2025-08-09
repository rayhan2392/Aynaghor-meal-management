// In-memory database for mock services

import type { User, Cycle, Deposit, Expense, MealEntry } from '@/types/models';
import { storage } from '@/services/storage/localStorage';
import { generateId } from '@/utils/id';

export interface MockDatabase {
  users: Map<string, User>;
  cycles: Map<string, Cycle>;
  deposits: Map<string, Deposit>;
  expenses: Map<string, Expense>;
  meals: Map<string, MealEntry>;
  meta: {
    currentCycleId?: string;
  };
}

class MockDB {
  private db: MockDatabase = {
    users: new Map(),
    cycles: new Map(),
    deposits: new Map(),
    expenses: new Map(),
    meals: new Map(),
    meta: {},
  };

  private isLoaded = false;

  // Initialize database from localStorage or with empty state
  private loadFromStorage(): void {
    if (this.isLoaded) return;

    try {
      const data = storage.loadAppData();

      // Load users
      this.db.users.clear();
      data.users.forEach((user: User) => {
        this.db.users.set(user._id, user);
      });

      // Load cycles
      this.db.cycles.clear();
      data.cycles.forEach((cycle: Cycle) => {
        this.db.cycles.set(cycle._id, cycle);
      });

      // Load deposits
      this.db.deposits.clear();
      data.deposits.forEach((deposit: Deposit) => {
        this.db.deposits.set(deposit._id, deposit);
      });

      // Load expenses
      this.db.expenses.clear();
      data.expenses.forEach((expense: Expense) => {
        this.db.expenses.set(expense._id, expense);
      });

      // Load meals
      this.db.meals.clear();
      data.meals.forEach((meal: MealEntry) => {
        this.db.meals.set(meal._id, meal);
      });

      // Load meta
      this.db.meta = data.meta;

      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load from storage:', error);
      this.isLoaded = true; // Continue with empty state
    }
  }

  // Save current state to localStorage
  private saveToStorage(): void {
    try {
      storage.saveAppData({
        users: Array.from(this.db.users.values()),
        cycles: Array.from(this.db.cycles.values()),
        deposits: Array.from(this.db.deposits.values()),
        expenses: Array.from(this.db.expenses.values()),
        meals: Array.from(this.db.meals.values()),
        meta: this.db.meta,
      });
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  // Generic CRUD operations
  create<T extends { _id: string; createdAt: string }>(
    collection: Map<string, T>,
    data: Omit<T, '_id' | 'createdAt'>
  ): T {
    this.loadFromStorage();

    const id = generateId();
    const entity = {
      ...data,
      _id: id,
      createdAt: new Date().toISOString(),
    } as T;

    collection.set(id, entity);
    this.saveToStorage();

    return entity;
  }

  findById<T>(collection: Map<string, T>, id: string): T | null {
    this.loadFromStorage();
    return collection.get(id) || null;
  }

  findAll<T>(collection: Map<string, T>): T[] {
    this.loadFromStorage();
    return Array.from(collection.values());
  }

  findWhere<T>(collection: Map<string, T>, predicate: (item: T) => boolean): T[] {
    this.loadFromStorage();
    return Array.from(collection.values()).filter(predicate);
  }

  update<T>(collection: Map<string, T>, id: string, updates: Partial<T>): T | null {
    this.loadFromStorage();

    const existing = collection.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    collection.set(id, updated);
    this.saveToStorage();

    return updated;
  }

  delete<T>(collection: Map<string, T>, id: string): boolean {
    this.loadFromStorage();

    const exists = collection.has(id);
    if (exists) {
      collection.delete(id);
      this.saveToStorage();
    }

    return exists;
  }

  // Specific accessors for each collection
  get users() {
    this.loadFromStorage();
    return this.db.users;
  }

  get cycles() {
    this.loadFromStorage();
    return this.db.cycles;
  }

  get deposits() {
    this.loadFromStorage();
    return this.db.deposits;
  }

  get expenses() {
    this.loadFromStorage();
    return this.db.expenses;
  }

  get meals() {
    this.loadFromStorage();
    return this.db.meals;
  }

  get meta() {
    this.loadFromStorage();
    return this.db.meta;
  }

  // Set meta data
  setMeta(key: string, value: any): void {
    this.loadFromStorage();
    this.db.meta = { ...this.db.meta, [key]: value };
    this.saveToStorage();
  }

  // Clear all data
  clear(): void {
    this.db = {
      users: new Map(),
      cycles: new Map(),
      deposits: new Map(),
      expenses: new Map(),
      meals: new Map(),
      meta: {},
    };
    storage.clear();
    this.isLoaded = false;
  }

  // Get current cycle
  getCurrentCycle(): Cycle | null {
    this.loadFromStorage();
    const currentCycleId = this.db.meta.currentCycleId;
    return currentCycleId ? this.findById(this.db.cycles, currentCycleId) : null;
  }

  // Set current cycle
  setCurrentCycle(cycleId: string): void {
    this.setMeta('currentCycleId', cycleId);
  }
}

export const mockDB = new MockDB();

// localStorage wrapper with error handling and versioning

export interface StorageData {
  version: number;
  lastSavedAt: string;
  users: any[];
  cycles: any[];
  deposits: any[];
  expenses: any[];
  meals: any[];
  meta: {
    currentCycleId?: string;
  };
}

const STORAGE_PREFIX = 'meal-mgr:v1:';
const CURRENT_VERSION = 1;

export class LocalStorage {
  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  // Save data to localStorage
  save<T>(key: string, data: T): void {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error('Failed to save data');
    }
  }

  // Load data from localStorage
  load<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  }

  // Remove data from localStorage
  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  // Clear all app data
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // Check if localStorage is available
  isAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // Get current data version
  getVersion(): number {
    return this.load('version', CURRENT_VERSION);
  }

  // Set data version
  setVersion(version: number): void {
    this.save('version', version);
  }

  // Save complete app state
  saveAppData(data: Omit<StorageData, 'version' | 'lastSavedAt'>): void {
    const storageData: StorageData = {
      ...data,
      version: CURRENT_VERSION,
      lastSavedAt: new Date().toISOString(),
    };

    // Save each collection separately for easier debugging
    this.save('users', data.users);
    this.save('cycles', data.cycles);
    this.save('deposits', data.deposits);
    this.save('expenses', data.expenses);
    this.save('meals', data.meals);
    this.save('meta', data.meta);
    this.save('version', CURRENT_VERSION);
    this.save('lastSavedAt', storageData.lastSavedAt);
  }

  // Load complete app state
  loadAppData(): StorageData {
    return {
      version: this.load('version', CURRENT_VERSION),
      lastSavedAt: this.load('lastSavedAt', new Date().toISOString()),
      users: this.load('users', []),
      cycles: this.load('cycles', []),
      deposits: this.load('deposits', []),
      expenses: this.load('expenses', []),
      meals: this.load('meals', []),
      meta: this.load('meta', {}),
    };
  }
}

export const storage = new LocalStorage();

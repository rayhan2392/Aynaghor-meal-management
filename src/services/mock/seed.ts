// Seed data for the application

import type { User, Cycle } from '@/types/models';
import { mockDB } from './db';
import { getCurrentMonthYear, getMonthStartEnd, getMonthName } from '@/utils/date';

// Predefined users (the 5 flatmates)
const USERS: Omit<User, '_id' | 'createdAt'>[] = [
  { name: 'Shawn', role: 'manager', active: true },
  { name: 'Sadi', role: 'member', active: true },
  { name: 'Masud', role: 'member', active: true },
  { name: 'Arnab', role: 'member', active: true },
  { name: 'Muzahid', role: 'member', active: true },
];

export function seedDatabase(): void {
  // Check if database is already seeded
  const existingUsers = mockDB.findAll(mockDB.users);
  if (existingUsers.length > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database...');

  // Create users
  const createdUsers: User[] = [];
  USERS.forEach(userData => {
    const user = mockDB.create(mockDB.users, userData);
    createdUsers.push(user);
  });

  // Create current month cycle
  const { month, year } = getCurrentMonthYear();
  const { startDate, endDate } = getMonthStartEnd(year, month);
  const monthName = getMonthName(month);

  const cycleData: Omit<Cycle, '_id' | 'createdAt'> = {
    name: `${monthName} ${year}`,
    month,
    year,
    startDate,
    endDate,
    status: 'open',
  };

  const cycle = mockDB.create(mockDB.cycles, cycleData);

  // Set as current cycle
  mockDB.setCurrentCycle(cycle._id);

  console.log(`Seeded ${createdUsers.length} users and 1 cycle (${cycle.name})`);
}

// Reset database and reseed
export function resetDatabase(): void {
  console.log('Resetting database...');
  mockDB.clear();
  seedDatabase();
}

// Check if seeding is needed
export function checkAndSeed(): void {
  const existingUsers = mockDB.findAll(mockDB.users);
  if (existingUsers.length === 0) {
    seedDatabase();
  }
}

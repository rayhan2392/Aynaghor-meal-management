// User API service (mock implementation)

import type { User } from '@/types/models';
import { mockDB } from '@/services/mock/db';

// Simulate API delay
function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function listUsers(): Promise<User[]> {
  await delay();
  return mockDB.findAll(mockDB.users);
}

export async function getUserById(id: string): Promise<User | null> {
  await delay();
  return mockDB.findById(mockDB.users, id);
}

export async function updateUser(id: string, updates: Partial<Pick<User, 'name' | 'role' | 'active'>>): Promise<User | null> {
  await delay();
  return mockDB.update(mockDB.users, id, updates) as User | null;
}

// Get manager user
export async function getManager(): Promise<User | null> {
  await delay();
  const users = mockDB.findWhere(mockDB.users, user => user.role === 'manager');
  return users[0] || null;
}

// Get active members (excluding manager)
export async function getActiveMembers(): Promise<User[]> {
  await delay();
  return mockDB.findWhere(mockDB.users, user => user.active && user.role === 'member');
}

// Get all active users (including manager)
export async function getActiveUsers(): Promise<User[]> {
  await delay();
  return mockDB.findWhere(mockDB.users, user => user.active);
}

// Cycle API service (mock implementation)

import type { Cycle } from '@/types/models';
import type { CreateCycleDTO } from '@/types/dto';
import { mockDB } from '@/services/mock/db';

// Simulate API delay
function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function listCycles(): Promise<Cycle[]> {
  await delay();
  return mockDB.findAll(mockDB.cycles);
}

export async function getCycleById(id: string): Promise<Cycle | null> {
  await delay();
  return mockDB.findById(mockDB.cycles, id);
}

export async function createCycle(data: CreateCycleDTO): Promise<Cycle> {
  await delay();

  // Close any existing open cycles
  const openCycles = mockDB.findWhere(mockDB.cycles, cycle => cycle.status === 'open');
  openCycles.forEach(cycle => {
    mockDB.update(mockDB.cycles, cycle._id, { status: 'closed' });
  });

  // Create new cycle
  const cycle = mockDB.create(mockDB.cycles, {
    ...data,
    status: 'open' as const,
  });

  // Set as current cycle
  mockDB.setCurrentCycle(cycle._id);

  return cycle;
}

export async function closeCycle(id: string): Promise<Cycle | null> {
  await delay();
  return mockDB.update(mockDB.cycles, id, { status: 'closed' });
}

export async function reopenCycle(id: string): Promise<Cycle | null> {
  await delay();

  // Close any other open cycles
  const openCycles = mockDB.findWhere(mockDB.cycles, cycle => cycle.status === 'open');
  openCycles.forEach(cycle => {
    mockDB.update(mockDB.cycles, cycle._id, { status: 'closed' });
  });

  // Reopen this cycle
  const cycle = mockDB.update(mockDB.cycles, id, { status: 'open' });

  if (cycle) {
    mockDB.setCurrentCycle(id);
  }

  return cycle;
}

export async function getCurrentCycle(): Promise<Cycle | null> {
  await delay();
  return mockDB.getCurrentCycle();
}

export async function getOpenCycle(): Promise<Cycle | null> {
  await delay();
  const openCycles = mockDB.findWhere(mockDB.cycles, cycle => cycle.status === 'open');
  return openCycles[0] || null;
}

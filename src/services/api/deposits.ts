// Deposits API service (mock implementation)

import type { Deposit } from '@/types/models';
import type { CreateDepositDTO, UpdateDepositDTO } from '@/types/dto';
import { mockDB } from '@/services/mock/db';

// Simulate API delay
function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function listDeposits(cycleId: string): Promise<Deposit[]> {
  await delay();
  return mockDB.findWhere(mockDB.deposits, deposit => deposit.cycleId === cycleId);
}

export async function getDepositById(id: string): Promise<Deposit | null> {
  await delay();
  return mockDB.findById(mockDB.deposits, id);
}

export async function createDeposit(data: CreateDepositDTO): Promise<Deposit> {
  await delay();
  return mockDB.create(mockDB.deposits, data);
}

export async function updateDeposit(id: string, data: UpdateDepositDTO): Promise<Deposit | null> {
  await delay();
  return mockDB.update(mockDB.deposits, id, data);
}

export async function deleteDeposit(id: string): Promise<void> {
  await delay();
  const deleted = mockDB.delete(mockDB.deposits, id);
  if (!deleted) {
    throw new Error('Deposit not found');
  }
}

// Get deposits by user for a cycle
export async function getDepositsByUser(cycleId: string, userId: string): Promise<Deposit[]> {
  await delay();
  return mockDB.findWhere(mockDB.deposits,
    deposit => deposit.cycleId === cycleId && deposit.userId === userId
  );
}

// Get total deposits for a cycle
export async function getTotalDeposits(cycleId: string): Promise<string> {
  await delay();
  const deposits = await listDeposits(cycleId);
  return deposits.reduce((total, deposit) => {
    return (parseFloat(total) + parseFloat(deposit.amount)).toString();
  }, '0');
}

// Get total deposits by user for a cycle
export async function getTotalDepositsByUser(cycleId: string): Promise<Record<string, string>> {
  await delay();
  const deposits = await listDeposits(cycleId);
  const totals: Record<string, string> = {};

  deposits.forEach(deposit => {
    const current = totals[deposit.userId] || '0';
    totals[deposit.userId] = (parseFloat(current) + parseFloat(deposit.amount)).toString();
  });

  return totals;
}

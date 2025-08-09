// Expenses API service (mock implementation)

import type { Expense } from '@/types/models';
import type { CreateExpenseDTO, UpdateExpenseDTO } from '@/types/dto';
import { mockDB } from '@/services/mock/db';

// Simulate API delay
function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function listExpenses(cycleId: string): Promise<Expense[]> {
  await delay();
  return mockDB.findWhere(mockDB.expenses, expense => expense.cycleId === cycleId);
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  await delay();
  return mockDB.findById(mockDB.expenses, id);
}

export async function createExpense(data: CreateExpenseDTO): Promise<Expense> {
  await delay();
  return mockDB.create(mockDB.expenses, data);
}

export async function updateExpense(id: string, data: UpdateExpenseDTO): Promise<Expense | null> {
  await delay();
  return mockDB.update(mockDB.expenses, id, data);
}

export async function deleteExpense(id: string): Promise<void> {
  await delay();
  const deleted = mockDB.delete(mockDB.expenses, id);
  if (!deleted) {
    throw new Error('Expense not found');
  }
}

// Get expenses by date for a cycle
export async function getExpensesByDate(cycleId: string, date: string): Promise<Expense[]> {
  await delay();
  return mockDB.findWhere(mockDB.expenses,
    expense => expense.cycleId === cycleId && expense.date.startsWith(date.split('T')[0])
  );
}

// Get total expenses for a cycle
export async function getTotalExpenses(cycleId: string): Promise<string> {
  await delay();
  const expenses = await listExpenses(cycleId);
  return expenses.reduce((total, expense) => {
    return (parseFloat(total) + parseFloat(expense.amount)).toString();
  }, '0');
}

// Get personal expenses by user (expenses paid personally by each user)
export async function getPersonalExpensesByUser(cycleId: string): Promise<Record<string, string>> {
  await delay();
  const expenses = await listExpenses(cycleId);
  const totals: Record<string, string> = {};

  expenses
    .filter(expense => expense.paidFrom === 'personal' && expense.payerUserId)
    .forEach(expense => {
      const userId = expense.payerUserId!;
      const current = totals[userId] || '0';
      totals[userId] = (parseFloat(current) + parseFloat(expense.amount)).toString();
    });

  return totals;
}

// Get pool expenses total
export async function getPoolExpenses(cycleId: string): Promise<string> {
  await delay();
  const expenses = await listExpenses(cycleId);
  return expenses
    .filter(expense => expense.paidFrom === 'pool')
    .reduce((total, expense) => {
      return (parseFloat(total) + parseFloat(expense.amount)).toString();
    }, '0');
}

import type { User, Deposit, Expense, MealEntry } from '@/types/models';
import { Money, addMoney, multiplyMoney, roundMoney } from './money';

export interface PerUserSummary {
  userId: string;
  name: string;
  meals: number;
  deposited: string;
  share: string;        // rounded to whole BDT
  net: string;          // deposited - share (positive = gets back, negative = owes)
}

export interface SettlementResult {
  perMealRate: string;  // precise calculation
  totalCost: string;
  totalMeals: number;
  totalDeposits: string;
  perUser: PerUserSummary[];
  transfers: Transfer[];
}

export interface Transfer {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: string;
}

export interface InterimTotals {
  totalDeposits: string;
  totalExpenses: string;
  totalMeals: number;
  interimPerMealRate: string;
  perUser: Array<{
    userId: string;
    name: string;
    deposited: string;
    meals: number;
    burn: string;
    net: string;
  }>;
}

// Calculate month-to-date totals and interim stats
export function computeInterimTotals(
  users: User[],
  deposits: Deposit[],
  expenses: Expense[],
  meals: MealEntry[]
): InterimTotals {
  // Calculate totals
  const totalExpenses = addMoney(expenses.map(e => e.amount));
  const totalDeposits = addMoney(deposits.map(d => d.amount));

  // Calculate total meals
  const totalMeals = meals.reduce((sum, meal) =>
    sum + meal.lunch + meal.dinner + meal.guestMeals, 0
  );

  // Calculate interim per-meal rate
  const interimPerMealRate = totalMeals > 0
    ? new Money(totalExpenses).divide(totalMeals).toString()
    : '0';

  // Calculate per-user stats
  const perUser = users.map(user => {
    // User's total deposits (including personal-paid expenses)
    const userDeposits = deposits
      .filter(d => d.userId === user._id)
      .map(d => d.amount);

    const personalExpenses = expenses
      .filter(e => e.paidFrom === 'personal' && e.payerUserId === user._id)
      .map(e => e.amount);

    const deposited = addMoney([...userDeposits, ...personalExpenses]);

    // User's total meals
    const userMeals = meals
      .filter(m => m.userId === user._id)
      .reduce((sum, meal) => sum + meal.lunch + meal.dinner + meal.guestMeals, 0);

    // User's burn so far
    const burn = multiplyMoney(interimPerMealRate, userMeals);

    // Net position so far
    const net = new Money(deposited).subtract(burn).toString();

    return {
      userId: user._id,
      name: user.name,
      deposited,
      meals: userMeals,
      burn,
      net,
    };
  });

  return {
    totalDeposits,
    totalExpenses,
    totalMeals,
    interimPerMealRate,
    perUser,
  };
}

// Calculate final settlement for month close
export function computeFinalSettlement(
  users: User[],
  deposits: Deposit[],
  expenses: Expense[],
  meals: MealEntry[]
): SettlementResult {
  // Calculate totals
  const totalCost = addMoney(expenses.map(e => e.amount));
  const totalDeposits = addMoney(deposits.map(d => d.amount));

  // Add personal-paid expenses to total deposits
  const personalExpenseTotal = addMoney(
    expenses
      .filter(e => e.paidFrom === 'personal')
      .map(e => e.amount)
  );
  const adjustedTotalDeposits = addMoney([totalDeposits, personalExpenseTotal]);

  // Calculate total meals
  const totalMeals = meals.reduce((sum, meal) =>
    sum + meal.lunch + meal.dinner + meal.guestMeals, 0
  );

  // Calculate precise per-meal rate
  const perMealRate = totalMeals > 0
    ? new Money(totalCost).divide(totalMeals).toString()
    : '0';

  // Calculate per-user shares and nets
  const perUser: PerUserSummary[] = users.map(user => {
    // User's total deposits (including personal-paid expenses)
    const userDeposits = deposits
      .filter(d => d.userId === user._id)
      .map(d => d.amount);

    const personalExpenses = expenses
      .filter(e => e.paidFrom === 'personal' && e.payerUserId === user._id)
      .map(e => e.amount);

    const deposited = addMoney([...userDeposits, ...personalExpenses]);

    // User's total meals
    const userMeals = meals
      .filter(m => m.userId === user._id)
      .reduce((sum, meal) => sum + meal.lunch + meal.dinner + meal.guestMeals, 0);

    // User's precise share
    const preciseShare = multiplyMoney(perMealRate, userMeals);

    // Round to whole BDT
    const share = roundMoney(preciseShare);

    // Calculate net (positive = gets back, negative = owes)
    const net = new Money(deposited).subtract(share).toString();

    return {
      userId: user._id,
      name: user.name,
      meals: userMeals,
      deposited,
      share,
      net,
    };
  });

  // Apply penny adjustment to ensure total shares equal total cost
  const totalShares = addMoney(perUser.map(u => u.share));
  const difference = new Money(totalCost).subtract(totalShares);

  if (!difference.isZero()) {
    // Find user with largest absolute share to apply adjustment
    const largestUser = perUser.reduce((max, user) =>
      new Money(user.share).greaterThan(max.share) ? user : max
    );

    const adjustedShare = new Money(largestUser.share).add(difference);
    largestUser.share = adjustedShare.toString();
    largestUser.net = new Money(largestUser.deposited).subtract(adjustedShare).toString();
  }

  // Generate transfer suggestions
  const transfers = generateTransfers(perUser);

  return {
    perMealRate,
    totalCost,
    totalMeals,
    totalDeposits: adjustedTotalDeposits,
    perUser,
    transfers,
  };
}

// Generate minimal transfer suggestions to settle all debts
function generateTransfers(perUser: PerUserSummary[]): Transfer[] {
  const transfers: Transfer[] = [];

  // Separate creditors (positive net) and debtors (negative net)
  const creditors = perUser
    .filter(user => new Money(user.net).isPositive())
    .map(user => ({ ...user, remaining: new Money(user.net) }))
    .sort((a, b) => b.remaining.subtract(a.remaining).toNumber());

  const debtors = perUser
    .filter(user => new Money(user.net).lessThan('0'))
    .map(user => ({ ...user, remaining: new Money(user.net).multiply(-1) }))
    .sort((a, b) => b.remaining.subtract(a.remaining).toNumber());

  // Match largest creditor with largest debtor
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    // Transfer the minimum of what creditor is owed and what debtor owes
    const transferAmount = creditor.remaining.lessThan(debtor.remaining)
      ? creditor.remaining
      : debtor.remaining;

    if (transferAmount.isPositive()) {
      transfers.push({
        fromUserId: debtor.userId,
        fromName: debtor.name,
        toUserId: creditor.userId,
        toName: creditor.name,
        amount: roundMoney(transferAmount.toString()),
      });

      // Update remaining amounts
      creditor.remaining = creditor.remaining.subtract(transferAmount);
      debtor.remaining = debtor.remaining.subtract(transferAmount);
    }

    // Move to next creditor or debtor if current one is settled
    if (creditor.remaining.isZero()) {
      creditorIndex++;
    }
    if (debtor.remaining.isZero()) {
      debtorIndex++;
    }
  }

  return transfers;
}

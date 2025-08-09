import Decimal from 'decimal.js';

// Configure Decimal.js for precise money calculations
Decimal.set({
  precision: 20,  // High precision for intermediate calculations
  rounding: Decimal.ROUND_HALF_UP,  // Standard rounding
});

export class Money {
  private decimal: Decimal;

  constructor(value: string | number | Decimal) {
    this.decimal = new Decimal(value);
  }

  add(other: Money | string | number): Money {
    return new Money(this.decimal.add(new Decimal(other instanceof Money ? other.toString() : other)));
  }

  subtract(other: Money | string | number): Money {
    return new Money(this.decimal.sub(new Decimal(other instanceof Money ? other.toString() : other)));
  }

  multiply(other: Money | string | number): Money {
    return new Money(this.decimal.mul(new Decimal(other instanceof Money ? other.toString() : other)));
  }

  divide(other: Money | string | number): Money {
    return new Money(this.decimal.div(new Decimal(other instanceof Money ? other.toString() : other)));
  }

  // Round to whole BDT (no decimals)
  round(): Money {
    return new Money(this.decimal.round());
  }

  // Get precise string representation
  toString(): string {
    return this.decimal.toString();
  }

  // Get whole BDT as number (for display)
  toNumber(): number {
    return this.decimal.round().toNumber();
  }

  // Check if positive
  isPositive(): boolean {
    return this.decimal.isPositive();
  }

  // Check if zero
  isZero(): boolean {
    return this.decimal.isZero();
  }

  // Compare values
  equals(other: Money | string | number): boolean {
    return this.decimal.equals(new Decimal(other instanceof Money ? other.toString() : other));
  }

  greaterThan(other: Money | string | number): boolean {
    return this.decimal.greaterThan(new Decimal(other instanceof Money ? other.toString() : other));
  }

  lessThan(other: Money | string | number): boolean {
    return this.decimal.lessThan(new Decimal(other instanceof Money ? other.toString() : other));
  }
}

// Utility functions for money operations
export function addMoney(amounts: (string | number | Decimal)[]): string {
  return amounts
    .reduce((sum, amount) => sum.add(amount), new Money('0'))
    .toString();
}

export function subtractMoney(minuend: string | number, subtrahend: string | number): string {
  return new Money(minuend).subtract(subtrahend).toString();
}

export function multiplyMoney(amount: string | number, multiplier: string | number): string {
  return new Money(amount).multiply(multiplier).toString();
}

export function divideMoney(dividend: string | number, divisor: string | number): string {
  return new Money(dividend).divide(divisor).toString();
}

// Round to whole BDT
export function roundMoney(amount: string | number): string {
  return new Money(amount).round().toString();
}

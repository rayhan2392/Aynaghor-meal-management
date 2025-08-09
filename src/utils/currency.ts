// Simple currency formatting for BDT
export function formatBDT(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `৳${Math.round(numValue).toLocaleString('en-BD')}`;
}
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Configure dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export const DHAKA_TIMEZONE = 'Asia/Dhaka';

// Get current date in Dhaka timezone as ISO string (start of day)
export function todayDhakaISO(): string {
  return dayjs().tz(DHAKA_TIMEZONE).startOf('day').toISOString();
}

// Convert any date to Dhaka start of day
export function toDhakaStartOfDay(date: string | Date | Dayjs): string {
  return dayjs(date).tz(DHAKA_TIMEZONE).startOf('day').toISOString();
}

// Convert any date to Dhaka end of day
export function toDhakaEndOfDay(date: string | Date | Dayjs): string {
  return dayjs(date).tz(DHAKA_TIMEZONE).endOf('day').toISOString();
}

// Get month boundaries in Dhaka timezone
export function getMonthStartEnd(year: number, month: number): { startDate: string; endDate: string } {
  const start = dayjs().tz(DHAKA_TIMEZONE).year(year).month(month - 1).startOf('month');
  const end = dayjs().tz(DHAKA_TIMEZONE).year(year).month(month - 1).endOf('month');
  
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

// Check if a date falls within a cycle
export function isWithinCycle(dateISO: string, cycle: { startDate: string; endDate: string }): boolean {
  const date = dayjs(dateISO);
  const start = dayjs(cycle.startDate);
  const end = dayjs(cycle.endDate);
  
  return date.isSameOrAfter(start) && date.isSameOrBefore(end);
}

// Format date for display in Dhaka timezone
export function formatDateDisplay(dateISO: string): string {
  return dayjs(dateISO).tz(DHAKA_TIMEZONE).format('DD MMM YYYY');
}

// Format date for input fields (YYYY-MM-DD)
export function formatDateInput(dateISO: string): string {
  return dayjs(dateISO).tz(DHAKA_TIMEZONE).format('YYYY-MM-DD');
}

// Parse input date to ISO string (start of day in Dhaka)
export function parseDateInput(dateInput: string): string {
  return dayjs(dateInput, 'YYYY-MM-DD').tz(DHAKA_TIMEZONE).startOf('day').toISOString();
}

// Get days between two dates
export function getDaysBetween(startISO: string, endISO: string): number {
  const start = dayjs(startISO);
  const end = dayjs(endISO);
  return end.diff(start, 'day') + 1; // Include both start and end days
}

// Get array of dates between start and end (inclusive)
export function getDateRange(startISO: string, endISO: string): string[] {
  const dates: string[] = [];
  let current = dayjs(startISO).tz(DHAKA_TIMEZONE).startOf('day');
  const end = dayjs(endISO).tz(DHAKA_TIMEZONE).startOf('day');
  
  while (current.isSameOrBefore(end)) {
    dates.push(current.toISOString());
    current = current.add(1, 'day');
  }
  
  return dates;
}

// Get current month and year
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = dayjs().tz(DHAKA_TIMEZONE);
  return {
    month: now.month() + 1, // dayjs months are 0-indexed
    year: now.year(),
  };
}

// Get month name from number
export function getMonthName(month: number): string {
  return dayjs().month(month - 1).format('MMMM');
}

import {
  startOfMonth,
  addMonths,
  previousDay,
  lastDayOfMonth,
  getDay,
  nextDay,
  Day,
  getWeek,
  setWeek,
  isSameMonth,
  differenceInDays,
  addDays,
} from 'date-fns';

interface InvoiceConfig {
  startDate: Date;
  endDate: Date;
  sendOn: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  frequency: 'monthly' | 'weekly';
  invoiceWeek: 1 | 2 | 3 | 4 | 5; // 5 is the last week of the month
}

enum WeekdaysEnum {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

const LAST_WEEK_INDEX = 5;
function getInvoiceDateForLastWeekOfMonth(
  startDateOfMonth: Date,
  sendOnWeekday: number
): Date {
  const lastDateOfMonth = lastDayOfMonth(startDateOfMonth);

  // If the last day of the month is the same day as the sendOn day, use it
  // Otherwise, find the previous sendOn day in the last week of the month
  return getDay(lastDateOfMonth) === sendOnWeekday
    ? lastDateOfMonth
    : previousDay(lastDateOfMonth, sendOnWeekday);
}

function shouldSkipInvoiceDate(invoiceDate: Date, startDate: Date): boolean {
  if (
    isSameMonth(invoiceDate, startDate) &&
    (invoiceDate < startDate || differenceInDays(invoiceDate, startDate) < 15)
  ) {
    return true;
  }

  return false;
}

function isLastDayOfMonthInvoiceDate(
  invoiceDate: Date,
  endDate: Date
): boolean {
  if (isSameMonth(invoiceDate, endDate)) return true;
  return false;
}

function determineMonthlyInvoiceDate(config: InvoiceConfig) {
  const { startDate, endDate, invoiceWeek, sendOn } = config;
  const invoiceDates = [];
  let evaluatedDate = new Date(startDate);

  while (evaluatedDate <= endDate) {
    const startDateOfMonth = startOfMonth(evaluatedDate);
    let invoiceDate: Date;

    // Consider the last week of the month
    if (invoiceWeek === LAST_WEEK_INDEX) {
      invoiceDate = getInvoiceDateForLastWeekOfMonth(
        startDateOfMonth,
        WeekdaysEnum[sendOn]
      );
    } else {
      const weekIndex = getWeek(startDateOfMonth);
      const dateWithWeeks = setWeek(
        startDateOfMonth,
        weekIndex + invoiceWeek - 1
      );

      invoiceDate =
        getDay(dateWithWeeks) === WeekdaysEnum[sendOn]
          ? dateWithWeeks
          : nextDay(dateWithWeeks, WeekdaysEnum[sendOn] as Day);
    }

    if (shouldSkipInvoiceDate(invoiceDate, startDate)) {
      evaluatedDate = addMonths(evaluatedDate, 1);
      continue;
    }

    if (isLastDayOfMonthInvoiceDate(invoiceDate, endDate)) {
      invoiceDate = addDays(endDate, 1);
    }

    invoiceDates.push(invoiceDate);
    evaluatedDate = addMonths(evaluatedDate, 1);
  }

  console.log(invoiceDates);
}

determineMonthlyInvoiceDate({
  startDate: new Date('2024-01-08'),
  endDate: new Date('2024-12-12'),
  frequency: 'monthly',
  invoiceWeek: 4,
  sendOn: 'Monday',
});

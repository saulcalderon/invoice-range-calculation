import {
  startOfMonth,
  getWeek,
  setWeek,
  getDay,
  nextDay,
  addMonths,
  addBusinessDays,
  lastDayOfMonth,
  previousDay,
  isSameMonth,
  differenceInDays,
  startOfWeek,
  isAfter,
  isSameDay,
  isEqual,
  parse,
} from 'date-fns';

export type InvoiceWeek = 1 | 2 | 3 | 4 | 5; // 5th week is last week of month

export interface InvoiceConfig {
  startDate: Date;
  endDate: Date;
  sendOn:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';
  frequency: 'Monthly' | 'Weekly' | 'BiWeekly';
  invoiceWeek?: InvoiceWeek;
}

const LAST_WEEK_OF_MONTH_INDEX = 5;
const MINIMUM_DAYS_FROM_START_DATE_TO_INVOICE_DATE = 15;

enum WeekDaysIndexEnum {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

// function calculateInvoiceDates(configuration: InvoiceConfig): Date[] {
//   const { startDate, endDate, invoiceWeek, sendOn } = configuration;
//   const invoiceDates = [];
//   let evaluatedDate = new Date(startDate);

//   while (evaluatedDate <= endDate) {
//     const startDateOfMonth = startOfMonth(evaluatedDate);
//     let invoiceDate: Date;

//     // Consider the last week of the month
//     if (invoiceWeek === LAST_WEEK_OF_MONTH_INDEX) {
//     //   invoiceDate = getInvoiceDateForLastWeekOfMonth(
//     //     startDateOfMonth,
//     //     WeekDaysIndexEnum[sendOn]
//     //   );
//     } else {
//       const weekIndex = getWeek(startDateOfMonth);
//       const dateWithWeeks = setWeek(
//         startDateOfMonth,
//         weekIndex + invoiceWeek - 1
//       );

//       invoiceDate =
//         getDay(dateWithWeeks) === WeekDaysIndexEnum[sendOn]
//           ? dateWithWeeks
//           : nextDay(dateWithWeeks, WeekDaysIndexEnum[sendOn] as Day);
//     }

//     if (shouldSkipFirstInvoiceDate(invoiceDate, startDate)) {
//       evaluatedDate = addMonths(evaluatedDate, 1);
//       continue;
//     }

//     if (isLastDayOfMonthInvoiceDate(invoiceDate, endDate)) {
//       invoiceDate = addBusinessDays(endDate, 1);
//     }

//     invoiceDates.push(invoiceDate);
//     evaluatedDate = addMonths(evaluatedDate, 1);
//   }

//   return invoiceDates;
// }

function calculateInvoiceDates(configuration: InvoiceConfig): Date[] {
  const { startDate, endDate, sendOn } = configuration;
  const invoiceDates = [];
  let evaluatedDate = new Date(startDate);

  while (evaluatedDate < endDate) {
    let invoiceDate: Date;
    console.log('evaluatedDate: -> ', evaluatedDate);

    const startDateOfWeek = startOfWeek(evaluatedDate);
    // console.log('startDateOfWeek: -> ', startDateOfWeek);

    const weekIndex = getWeek(evaluatedDate);
    // console.log('weekIndex: -> ', weekIndex);

    const dateWithWeeks = setWeek(startDateOfWeek, weekIndex + 1);

    invoiceDate = nextDay(dateWithWeeks, WeekDaysIndexEnum[sendOn] as Day);

    invoiceDates.push(invoiceDate);
    evaluatedDate = invoiceDate;
  }

  const lastInvoice = invoiceDates[invoiceDates.length - 1];

  if (isSameDay(endDate, lastInvoice)) {
    invoiceDates.pop();

    console.log('newLastInvoice: -> ', addBusinessDays(lastInvoice, 1));

    invoiceDates.push(addBusinessDays(lastInvoice, 1));
  }

  if (isAfter(lastInvoice, endDate)) {
    invoiceDates.pop();
    invoiceDates.pop();

    const newLastInvoice = invoiceDates[invoiceDates.length - 1];

    console.log('newLastInvoice  222: -> ', addBusinessDays(endDate, 1));

    invoiceDates.push(addBusinessDays(endDate, 1));
  }
  //  else if (isInvoiceDateAfterEndDate(lastInvoice, endDate)) {
  //   invoiceDates.pop();
  //   invoiceDates.pop();

  //   invoiceDates.push(addBusinessDays(endDate, 1));
  // }

  // if (isInvoiceDateAfterEndDate(lastInvoice, endDate)) {
  //   console.log('is after');

  //   invoiceDates.pop();
  // }

  return invoiceDates;
}

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

function shouldSkipFirstInvoiceDate(
  invoiceDate: Date,
  startDate: Date
): boolean {
  if (
    isSameMonth(invoiceDate, startDate) &&
    (invoiceDate < startDate ||
      differenceInDays(invoiceDate, startDate) <
        MINIMUM_DAYS_FROM_START_DATE_TO_INVOICE_DATE)
  ) {
    return true;
  }

  return false;
}

function isInvoiceDateAfterEndDate(invoiceDate: Date, endDate: Date): boolean {
  return isAfter(invoiceDate, endDate);
}

const parsedStartDate = parse('2024-01-16', 'yyyy-MM-dd', new Date());
const parsedEndDate = parse('2024-08-11', 'yyyy-MM-dd', new Date());

// console.log('parsedStartDate: -> ', parsedStartDate);
// console.log('parsedEndDate: -> ', parsedEndDate);

const result = calculateInvoiceDates({
  startDate: parsedStartDate,
  endDate: parsedEndDate,
  sendOn: 'Wednesday',
  frequency: 'BiWeekly',
  // invoiceWeek: 3
});

console.log(result);
console.log(result.length);

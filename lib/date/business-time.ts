export const CANCHAGO_TIME_ZONE = "America/Lima";
export const BUSINESS_OPEN_HOUR = 6;
export const BUSINESS_CLOSE_HOUR = 23;

interface BusinessDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatter = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: CANCHAGO_TIME_ZONE,

      year: "numeric",
      month: "2-digit",
      day: "2-digit",

      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",

      hourCycle: "h23",
    },
  );

export function getBusinessDateTimeParts(date: Date,): BusinessDateTimeParts {
  const parts = formatter.formatToParts(
      date,
    );

  const values = Object.fromEntries(
      parts
        .filter(
          (part) => part.type !== "literal",
        )
        .map(
          (part) => [
            part.type,
            part.value,
          ],
        ),
    );

  return {
    year:Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

export function isSameBusinessDay(startAt: Date, endAt: Date,): boolean {
  const start = getBusinessDateTimeParts(
      startAt,
    );

  const end = getBusinessDateTimeParts(
      endAt,
    );

  return (
    start.year === end.year &&
    start.month === end.month &&
    start.day === end.day
  );
}

export function isWholeBusinessHour(date: Date,): boolean {
  const parts = getBusinessDateTimeParts(
      date,
    );

  return (
    parts.minute === 0 &&
    parts.second === 0
  );
}

export function isWithinBusinessHours(startAt: Date, endAt: Date,): boolean {
  const start = getBusinessDateTimeParts(
      startAt,
    );

  const end = getBusinessDateTimeParts(
      endAt,
    );

  const startMinutes = start.hour * 60 + start.minute;

  const endMinutes = end.hour * 60 + end.minute;

  return (
    startMinutes >= BUSINESS_OPEN_HOUR * 60 &&
    endMinutes <= BUSINESS_CLOSE_HOUR * 60
  );
}
import { DateTime, Interval } from 'luxon';

export const DATE_FORMAT = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
export const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

export function toInterval(start: Date, end: Date, zone: string) {
  return Interval.fromDateTimes(
    DateTime.fromJSDate(start, { zone }),
    DateTime.fromJSDate(end, { zone })
  );
}

export function setTime(
  date: DateTime,
  time: string, // HH:mm:ss
  timezone: string = 'utc'
) {
  if (!TIME_REGEX.test(time)) throw new Error('Invalid time format');

  const { year, month, day } = date;
  const [hour, minute] = time.split(':').map(Number);

  return DateTime.fromObject(
    { year, month, day, hour, minute, second: 0 },
    { zone: timezone }
  );
}

export function timeToDateTime(time: string, timezone: string = 'utc') {
  const [hour, minute, second = 0] = time.split(':').map(Number);
  return DateTime.fromObject({ hour, minute, second }, { zone: timezone });
}

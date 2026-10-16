import { Dayjs } from '@ace-clublabs/shared-component-library';
import dayjs from 'dayjs';

/**
 * Best function ever created to fix UTC time conversion
 * @param date supports string or Date.
 * @param time assuming string HH:MM as the time-picker is not implemented yet.
 */
export const transformDateTimeToUTC = (
  date: Dayjs | string | Date,
  time: string,
  format = 'MM/DD/YYYY HH:mm'
) => {
  let helperDate: Dayjs;
  const [hours, minutes] = time.split(':');
  helperDate = dateTimeNoFormat(date, time);
  const dateWithTime = helperDate.add(parseInt(hours), 'hour').add(parseInt(minutes), 'minute');

  return dateWithTime
    .clone()
    .subtract(helperDate.utcOffset() * -1, 'minute')
    .format(format);
};

/**
 * @param date supports string or Date.
 * @param time assuming string HH:MM as the time-picker is not implemented yet.
 */
export const transformDateTimeFormat = (
  date: Dayjs | string | Date,
  time: string,
  format = 'MM/DD/YYYY HH:mm'
) => {
  let helperDate: Dayjs;
  const [hours, minutes] = time.split(':');
  helperDate = dateTimeNoFormat(date, time);
  const dateWithTime = helperDate.add(parseInt(hours), 'hour').add(parseInt(minutes), 'minute');

  return dateWithTime.clone().format(format);
};

const dateTimeNoFormat = (date: Dayjs | string | Date, time: string) => {
  let helperDate: Dayjs;
  if (typeof date === 'string') {
    helperDate = dayjs(date);
  } else if ('toISOString' in date) {
    helperDate = dayjs(date.toISOString());
  } else {
    helperDate = date as Dayjs;
  }

  return helperDate;
};

import dayjs from 'dayjs';
import { describe, expect } from 'vitest';
import { transformDateTimeFormat, transformDateTimeToUTC } from './dayjsDateHelper';

describe('converDate', () => {
  it('using with dayjs', () => {
    const date = transformDateTimeToUTC(dayjs('10/10/2010'), '10:00');

    expect(date).toEqual('10/10/2010 03:00');
  });

  it('using with string', () => {
    const date = transformDateTimeToUTC('10/10/2010', '10:00');

    expect(date).toEqual('10/10/2010 03:00');
  });

  it('using with javascript date object', () => {
    const date = transformDateTimeToUTC(new Date('10/10/2010'), '10:00');

    expect(date).toEqual('10/10/2010 03:00');
  });

  it('using with javascript date object', () => {
    const date = transformDateTimeToUTC(new Date('10/10/2010').toISOString(), '10:00');

    expect(date).toEqual('10/10/2010 03:00');
  });

  it('using with javascript date object', () => {
    const date = transformDateTimeFormat(new Date('10/10/2010').toISOString(), '10:00');

    expect(date).toEqual('10/10/2010 10:00');
  });

  it('using with javascript date object', () => {
    const date = transformDateTimeFormat(new Date('10/10/2010').toISOString(), '22:00');

    expect(date).toEqual('10/10/2010 22:00');
  });
});

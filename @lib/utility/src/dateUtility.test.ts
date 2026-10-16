import {
  LocalStringFormatOptions,
  replaceNth,
  toLocaleString
} from './dateUtility';
describe('Claim Center formats', () => {
  const millisecondsForDate = 1652630785289;
  const now = new Date(millisecondsForDate);

  it('shows desired Claim Center adjusterNote format', () => {
    const isoDateString = `2022-05-15T17:00:00.000Z`;
    const options: LocalStringFormatOptions = {
      weekday: undefined,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: process.env.TZ
    };
    let datePhrase = toLocaleString(isoDateString, options);
    datePhrase = replaceNth(datePhrase, 2, ',', '');
    expect(datePhrase).toBe('May 15, 2022 at 10:00:00 AM'); // This change depending of the node version for 16 we need to remove the "at"
  });
});

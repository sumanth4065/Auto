export const toLocaleString = (isoStringDate: string, options: LocalStringFormatOptions) => {
  let date = new Date(isoStringDate);
  let datePhrase = date.toLocaleTimeString('en-us', options);
  return datePhrase;
};

export type LocalStringFormatOptions = {
  weekday: 'long' | 'short' | 'narrow' | undefined;
  year: 'numeric';
  month: 'long' | 'short' | 'narrow';
  day: 'numeric';
  hour: '2-digit';
  minute: '2-digit';
  second: '2-digit';
  hour12: boolean;
  timeZone?: string; // By default UTC is used
};

export const replaceNth = (str: string, n: number, find: string, repl: string) => {
  var A = str.split(find);
  return A.slice(0, n).join(find) + repl + A.slice(n).join(find);
};

export const AllowedVehicleYears = {
  min: 1900,
  max: new Date().getFullYear() + 1,
} as const;
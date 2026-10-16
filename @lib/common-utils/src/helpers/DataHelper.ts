// field names are case-sensitive

export const PHONE_NUMBER_FIELDS = [
  'cellNumber',
  'homeNumber',
  'phone',
  'phoneNumber',
  'workNumber'
];
export const STATE_FIELDS = ['State', 'state'];

export const sanitizePhoneNumbers = (data: object) => {
  return sanitizeDataSafe(data, PHONE_NUMBER_FIELDS, sanitizePhoneNumber);
};

export const sanitizeStates = (data: object) => {
  return sanitizeDataSafe(data, STATE_FIELDS, sanitizeState);
};

export const sanitizeData = (data: object, fields: string[], sanitizeFn) => {
  return sanitizeDataSafe(data, fields, sanitizeFn);
};

export const sanitizeAllData = (data: object) => {
  let obj = sanitizePhoneNumbers(data);
  return(sanitizeStates(obj));
};

/**
 *
 * @param data : object to be sanitized
 * @param fields : fields to be sanitized
 * @param sanitizeFn : the function to sanitize the specified field
 * @returns the cloned object
 *
 * Notes: this function preserves the 'data' object's values immutability as the work is done on a clone object
 */

export const sanitizeDataSafe = (data: object, fields: string[], sanitizeFn) => {
  const cloneData = JSON.parse(JSON.stringify(data));
  return sanitizeDataUnsafe(cloneData, fields, sanitizeFn);
};

/**
 *
 * @param data : object to be sanitized
 * @param fields : fields to be sanitized
 * @param sanitizeFn : the function to sanitize the specified field
 * @returns the object
 *
 * Notes: this function overwrites the 'data' object's values as the work is done on the data object itself
 */

export const sanitizeDataUnsafe = (data: object, fields: string[], sanitizeFn) => {
  if (!data) return undefined;
  const keys = Object.keys(data);
  keys.forEach(key => {
    if (typeof data[key] === 'object') {
      data[key] = sanitizeDataUnsafe(data[key], fields, sanitizeFn);
    }
    else if (fields.includes(key)) {
      const valueOfKey = data[key];
      const typeOfKey = typeof valueOfKey;
      switch (typeOfKey) {
        // if attr matches key and it's a complex object, we need to traverse the object to find the primitive attributes
        case 'object': {
          data[key] = sanitizeDataUnsafe(valueOfKey, fields, sanitizeFn);
          break;
        }
        // if attr matches key and it's a primitive, sanitize that key/value
        case 'string':
        case 'number': {
          if (fields.includes(key)) data[key] = sanitizeFn(data[key]);
          break;
        }
        // otherwise, skip
        default:
          break;
      }
    } 
  });

  return data;
};

const REGEX_SPACES = /[ ]/g;
const REGEX_PHONE_NUMBER_SEPARATORS = /[ .+-]/g;

const REGEX_VALID_PHONE_NUMBER = /^\d{10}$/i;
const REGEX_VALID_STATES =
  /^(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)$/i;

const isValid = (str: string, regex) => {
  return regex.test(str);
};

export const stripChars = (str: string, regex, toChar: string = '') => {
  return str.replace(regex, toChar);
};

export const stripSpaces = (str: string) => {
  return stripChars(str, REGEX_SPACES);
};

// strips phone number of all [ spaces, '-', '.']
// returns a valid 10-digit phone number; otherwise returns ''

export const sanitizePhoneNumber = (phoneNumber: string, replacementChar = ''): string => {
  const str = stripChars(phoneNumber, REGEX_PHONE_NUMBER_SEPARATORS);
  return isValid(str, REGEX_VALID_PHONE_NUMBER) ? str : replacementChar;
};

export const isValidPhoneNumber = (phoneNumber: string): string => {
  return isValid(phoneNumber, REGEX_VALID_PHONE_NUMBER);
};

// strips state of all [ spaces ]
// returns a valid 2 chars state abbreviation (uppercase); otherwise returns ''

export const sanitizeState = (state: string, replacementChar = ''): string => {
  const str = stripSpaces(state);
  return isValid(str, REGEX_VALID_STATES) ? str.toUpperCase() : replacementChar;
};

export const isValidState = (state: string): string => {
  return isValid(state, REGEX_VALID_STATES);
};

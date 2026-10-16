import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should return expected date by given format', () => {
    const result = formatDate('1/1/2019');

    expect(result).toEqual('01/01/2019');
  });
  it('should return expected date by given format', () => {
    const result = formatDate('01/01/2019');

    expect(result).toEqual('01/01/2019');
  });
  it('should return expected date by given format', () => {
    const result = formatDate('01/01/19');

    expect(result).toEqual('01/01/2019');
  });
});

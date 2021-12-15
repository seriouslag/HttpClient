import { getIsSuccessfulHttpStatus } from './getIsSuccessfulHttpStatus';

describe('getIsSuccessfulHttpStatus', () => {
  it('return true if status is between 200 and 299', () => {
    expect.assertions(100);
    for (let i = 200; i <= 299; i++) {
      const result = getIsSuccessfulHttpStatus(i);
      expect(result).toBe(true);
    }
  });
  it('return false if status is greater than 300', () => {
    expect.assertions(1);
    const result = getIsSuccessfulHttpStatus(300);
    expect(result).toBe(false);
  });
  it('return false if status is less than 200', () => {
    expect.assertions(1);
    const result = getIsSuccessfulHttpStatus(199);
    expect(result).toBe(false);
  });
});

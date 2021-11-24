import { HttpError, isHttpError } from '../index';

describe('isHttpError', () => {
  it('should return true for HttpError', () => {
    const error = new HttpError('Internal Server Error');
    expect(isHttpError(error)).toBe(true);
  });

  it('should return false for non-HttpError', () => {
    const error = new Error('Internal Server Error');
    expect(isHttpError(error)).toBe(false);
  });
});

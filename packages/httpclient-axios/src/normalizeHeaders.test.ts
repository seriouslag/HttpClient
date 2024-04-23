import { normalizeAxiosHeaders } from './normalizeHeaders';

describe('normalizeHeaders', () => {
  it('should normalize headers', () => {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Encoding': ['gzip', 'deflate'],
      'X-Test': 123,
      'X-Test-Null': null,
    };

    const normalizedHeaders = normalizeAxiosHeaders(headers);
    expect(normalizedHeaders).toEqual({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip,deflate',
      'X-Test': '123',
      'X-Test-Null': '',
    });
  });
});

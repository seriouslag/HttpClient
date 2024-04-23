import { AxiosHeaders, AxiosResponse } from 'axios';

export const normalizeAxiosHeaders = (
  headers: AxiosResponse['headers'],
): Record<string, string> => {
  const normalizedHeaders: Record<string, string> = {};
  for (const key in headers) {
    const header = headers[key];
    if (typeof header === 'string') {
      normalizedHeaders[key] = header;
    } else if (Array.isArray(header)) {
      normalizedHeaders[key] = header.join(',');
    } else if (typeof header === 'number') {
      normalizedHeaders[key] = header.toString();
    } else if (header === undefined) {
      normalizedHeaders[key] = '';
    } else if (header === null) {
      normalizedHeaders[key] = '';
    } else if (header instanceof Blob) {
      console.error('Blob not supported');
    } else if (header instanceof ArrayBuffer) {
      console.error('ArrayBuffer not supported');
    } else if (header instanceof AxiosHeaders) {
      console.error('AxiosHeaders not supported');
    }
  }
  return normalizedHeaders;
};

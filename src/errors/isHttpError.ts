import { HttpError } from './HttpError';

export function isHttpError (error: any): error is HttpError {
  return 'isHttpClientError' in error;
}

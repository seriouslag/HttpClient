import { HttpError } from './HttpError';

export class AbortError extends HttpError {
  constructor (message: string) {
    super(message);
  }
}

import { HttpError } from './HttpError';

export class AbortError extends HttpError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

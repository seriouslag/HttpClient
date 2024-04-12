import { HttpError } from './HttpError';

export class TimeoutError extends HttpError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

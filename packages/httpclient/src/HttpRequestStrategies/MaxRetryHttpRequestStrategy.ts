import { Request, HttpResponse } from '../Adaptors';
import { ExponentialBackoffRequestStrategy } from './ExponentialBackoffRequestStrategy';

/** Retries HTTP requests immediately on non successful HTTP request until the max retry count.
 *  Stops retrying when a TOO MANY REQUESTS STATUS is received (status code: 429)
 */
export class MaxRetryHttpRequestStrategy extends ExponentialBackoffRequestStrategy {
  /**
   * @param maxRetryCount - The maximum number of retries to attempt, default is 5, set to 0 for indefinite retries
   */
  constructor(maxRetryCount: number = 5) {
    super({
      delayFirstRequest: false,
      maxRetryCount,
      baseDelay: 0,
      factor: 1,
      maxDelay: 0,
    });
  }

  public override async request<T = unknown>(
    request: Request<T>,
  ): Promise<HttpResponse<T>> {
    return await super.request(request);
  }
}

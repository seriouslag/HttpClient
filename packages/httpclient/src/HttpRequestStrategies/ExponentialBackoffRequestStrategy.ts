import { Sleep } from '../utilities/sleep';
import { getIsSuccessfulHttpStatus } from '../utilities/getIsSuccessfulHttpStatus';
import { HttpRequestStrategy } from '../HttpRequestStrategies/HttpRequestStrategy';
import { Request, HttpResponse } from '../Adaptors';

export interface ExponentialBackoffOptions {
  /** Determines if the first request will be delayed */
  delayFirstRequest?: boolean;
  /** The maximum number of retries to attempt, default is 5, set to 0 for indefinite retries */
  maxRetryCount?: number;
  /** The base delay in milliseconds, will be used to calculate backoff */
  baseDelay?: number;
  /** The maximum delay to use; set to -1 or undefined for no cap  */
  maxDelay?: number;
  /** The factor that will be used to grow the delay */
  factor?: number;
}

/** Retrys HTTP requests with a specified backoff strategy until the max retry count. */
export class ExponentialBackoffRequestStrategy implements HttpRequestStrategy {

  /** TOO MANY REQUESTS STATUS CODE */
  private TOO_MANY_REQUESTS_STATUS = 429;

  private delayFirstRequest: boolean;
  private maxRetryCount: number;
  private baseDelay: number;
  private factor: number;
  private maxDelay: number;

  constructor (private options: ExponentialBackoffOptions = {}) {
    const { delayFirstRequest, maxRetryCount, baseDelay, factor, maxDelay } = this.options;
    this.delayFirstRequest = delayFirstRequest ?? false;
    this.maxRetryCount = maxRetryCount ?? 5;
    this.baseDelay = baseDelay ?? 100;
    this.factor = factor ?? 2;
    this.maxDelay = maxDelay ?? -1;
  }

  public async request<T = unknown> (request: Request<T>): Promise<HttpResponse<T>> {
    let response: HttpResponse<T>;
    let retryCount = 0;
    let isSuccessfulHttpStatus = false;
    let isTooManyRequests = false;
    let isAtRetryLimit = false;
    let delay = this.baseDelay;

    do {
      if (this.getShouldDelay(retryCount)) {
        await Sleep(delay);
      }
      retryCount += 1;
      response = await request.do();
      isSuccessfulHttpStatus = getIsSuccessfulHttpStatus(response.status);
      isTooManyRequests = response.status === this.TOO_MANY_REQUESTS_STATUS;
      isAtRetryLimit = this.getIsAtRetryMax(retryCount);
      delay *= (this.factor * retryCount);
      // set delay to max delay if delay is greater than max delay
      if (this.maxDelay > -1 && delay > this.maxDelay) {
        delay = this.maxDelay;
      }
    } while (!isSuccessfulHttpStatus && !isTooManyRequests && !isAtRetryLimit);
    return response;
  }

  private getIsAtRetryMax (retryCount: number): boolean {
    return this.maxRetryCount === 0 ? false : retryCount >= this.maxRetryCount;
  }

  private getShouldDelay (retryCount: number): boolean {
    return retryCount !== 0 || this.delayFirstRequest;
  }
}

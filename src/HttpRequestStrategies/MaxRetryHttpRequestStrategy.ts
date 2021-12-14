import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getIsSuccessfulHttpStatus, HttpRequestStrategy } from '../index';

/** Retrys HTTP requests immediatly on non successful HTTP request until the max retry count.
 *  Stops retrying when a TOO MANY REQUESTS STATUS is recieved (status code: 429)
 */
export class MaxRetryHttpRequestStrategy implements HttpRequestStrategy {

  /** TOO MANY REQUESTS STATUS CODE */
  private TOO_MANY_REQUESTS_STATUS = 429;

  /**
   * @param maxRetryCount - The maximum number of retries to attempt, default is 5, set to 0 for indefinite retries
   */
  constructor (private maxRetryCount: number = 5) { }

  public async request<T = unknown> (client: AxiosInstance, axiosConfig: AxiosRequestConfig): Promise<AxiosResponse<T, any>> {
    let response: AxiosResponse<T, any>;
    let retryCount = 0;
    let isSuccessfulHttpStatus = false;
    let isTooManyRequests = false;
    let isAtRetryLimit = false;

    const increment = this.maxRetryCount <= 0 ? 0 : 1;
    do {
      retryCount += increment;
      response = await client.request<T>(axiosConfig);
      isSuccessfulHttpStatus = getIsSuccessfulHttpStatus(response.status);
      isTooManyRequests = response.status === this.TOO_MANY_REQUESTS_STATUS;
      isAtRetryLimit = this.maxRetryCount === 0 ? false : retryCount >= this.maxRetryCount;
    } while (!isSuccessfulHttpStatus && !isTooManyRequests && !isAtRetryLimit);
    return response;
  }
}

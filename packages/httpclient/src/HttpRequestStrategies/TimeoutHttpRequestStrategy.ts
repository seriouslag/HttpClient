import { DefaultHttpRequestStrategy } from './DefaultHttpRequestStrategy';
import { Request, HttpResponse } from '../Adaptors';

/** This strategy is used to set a timeout on a request */
export class TimeoutHttpRequestStrategy extends DefaultHttpRequestStrategy {
  /**
   * @param timeout - The max time a request can take before aborting
   */
  constructor(private timeout: number = 10000) {
    super();
  }

  public override async request<T = unknown>(
    request: Request<T>,
  ): Promise<HttpResponse<T>> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timed out'));
      }, this.timeout);
      super
        .request<T>(request)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
        .finally(() => clearTimeout(timeout));
    });
  }
}

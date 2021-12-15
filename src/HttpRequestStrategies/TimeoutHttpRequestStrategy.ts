import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { DefaultHttpRequestStrategy } from '../index';

/** This strategy is used to set a timeout on a request */
export class TimeoutHttpRequestStrategy extends DefaultHttpRequestStrategy {

  /**
   * @param timeout - The max time a request can take before aborting
   */
  constructor (private timeout: number = 10000) {
    super();
  }

  public override async request<T = unknown> (client: AxiosInstance, axiosConfig: AxiosRequestConfig): Promise<AxiosResponse<T, any>> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timed out'));
      }, this.timeout);
      super.request<T>(client, axiosConfig)
        .then((response) => {
          clearTimeout(timeout);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }
}

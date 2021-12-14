import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { HttpResponse, getIsSuccessfulHttpStatus, HttpRequestStrategy } from '../index';

/** The default HTTP request strat. No logic. */
export class DefaultHttpRequestStrategy implements HttpRequestStrategy {
  /** Passthrough request to axios */
  public async request<T = unknown> (client: AxiosInstance, axiosConfig: AxiosRequestConfig) {
    const response = await client.request<T>(axiosConfig);
    this.checkResponseStatus<T>(response);
    return response;
  }

  /** Validates the HTTP response is successful or throws an error */
  private checkResponseStatus<T = unknown> (response: HttpResponse<T>): HttpResponse<T> {
    const isSuccessful = getIsSuccessfulHttpStatus(response.status);
    if (isSuccessful) {
      return response;
    }
    throw response;
  }
}

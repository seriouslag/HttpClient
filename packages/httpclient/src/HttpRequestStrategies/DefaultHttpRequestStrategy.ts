import { Request, HttpResponse } from '../Adaptors';
import { getIsSuccessfulHttpStatus } from '../utilities/getIsSuccessfulHttpStatus';
import { HttpRequestStrategy } from './HttpRequestStrategy';

/** The default HTTP request strat. No logic. */
export class DefaultHttpRequestStrategy implements HttpRequestStrategy {
  /** Passthrough request to axios and check response is successful */
  public async request<T = unknown> (request: Request<T>) {
    const response = await request.do();
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

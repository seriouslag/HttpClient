import { HttpResponse, Request } from '../Adaptors';

/** How HTTP calls will be handled. */
export interface HttpRequestStrategy {
  /** Wrapper request around axios to add request and response logic */
  request: <T = unknown>(request: Request<T>) => Promise<HttpResponse<T>>;
}

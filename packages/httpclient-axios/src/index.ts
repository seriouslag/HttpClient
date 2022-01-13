import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Request, RequestConfig, HttpResponse, IHttpClientAdaptor, Logger, ABORT_MESSAGE, AbortError, HttpHeader } from '@seriouslag/httpclient';

export class AxiosRequest<T = unknown> implements Request<T> {
  constructor (private client: AxiosInstance, private config: RequestConfig, private axiosConfig: AxiosRequestConfig) { }

  public async do (): Promise<HttpResponse<T>> {
    const { CancelToken } = axios;

    const { noGlobal, cancelToken } = this.config;
    const client = noGlobal ? axios.create() : this.client;
    const source = CancelToken.source();

    let hasResolvedRequest = false;
    let hasCanceled = false;
    // bind cancel token
    if (cancelToken) {
      // if signal is already aborted then cancel the axios source
      if (cancelToken.signal.aborted) {
        hasCanceled = true;
        source.cancel(ABORT_MESSAGE);
        throw new AbortError(ABORT_MESSAGE);
      }
      cancelToken.signal.addEventListener('abort', () => {
        // do not cancel if already canceled
        if (hasCanceled)
          return;
        // do not cancel if request is already resolved
        if (hasResolvedRequest)
          return;
        // if signal is aborted then cancel the axios source
        source.cancel(ABORT_MESSAGE);
        hasCanceled = true;
      });
    }

    const response = await client.request<T>({
      ...this.axiosConfig, cancelToken: source.token,
    });
    hasResolvedRequest = true;
    const formattedResponse: HttpResponse<T> = {
      data:       response.data,
      headers:    response.headers ?? {},
      status:     response.status,
      statusText: response.statusText,
    };
    return formattedResponse;
  }
}

export class AxiosHttpClientAdaptor implements IHttpClientAdaptor {

  private client: AxiosInstance;

  constructor (options: AxiosRequestConfig = {}, private logger?: Logger) {
    this.client = axios.create(options);
  }

  public buildRequest<T = unknown> (config: RequestConfig) {

    const { headers, data, responseType, responseEncoding, url, method, params } = config;

    const axiosConfig: AxiosRequestConfig = {
      url, method, headers, data, params, responseType,
      // never have axios throw and error. Return request.
      validateStatus: () => true,
    };
    // axios for some reason does not allow the responseEncoding to be set
    if (responseEncoding)
      (axiosConfig as any).responseEncoding = responseEncoding;

    const request = new AxiosRequest<T>(this.client, config, axiosConfig);
    return request;
  }

  /** Add header to each HTTP request for this instance */
  public addGlobalApiHeader (header: HttpHeader) {
    const headers: Record<string, any> = this.client.defaults.headers!; // default headers always exist
    headers.common[header.name] = header.value;
  }

  /** Add headers to each HTTP request for this instance */
  public addGlobalApiHeaders (headers: HttpHeader[]) {
    headers.forEach((header) => this.addGlobalApiHeader(header));
  }
}

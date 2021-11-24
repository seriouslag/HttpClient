import axios, { AxiosInstance, AxiosRequestConfig, Method, ResponseType } from 'axios';
import { AbortError } from './errors/AbortError';
import { Logger } from './Logger';
import { ABORT_MESSAGE, ERROR_URL } from './strings';

export type HttpClientOptionType = 'baseURL' | 'headers' | 'withCredentials' | 'responseType' | 'xsrfCookieName' | 'xsrfHeaderName' | 'onUploadProgress' | 'onDownloadProgress' | 'httpAgent' | 'httpsAgent' | 'cancelToken';
export type HttpClientOptions = Pick<AxiosRequestConfig, HttpClientOptionType>;

/** Config used for setting up http calls */
export interface ApiConfig {
  /** If specified, a new axios instance is used instead of the one instantiated in the HttpClient's constructor */
  noGlobal?: boolean;
  /** The headers that will be used in the HTTP call. Global headers will be added to these. */
  headers?: Record<string, string>;
  /** The body of the request that will be sent */
  data?: any;
  /** The type of response that will be expected */
  responseType?: ResponseType;
  /** The query parameters that will be sent with the HTTP call */
  params?: any;
  /** The encoding of the response */
  responseEncoding?: string;
}

/** Response data from using the fetch request */
export interface HttpResponse<T> {
  /** Response headers */
  headers: Record<string, string>;
  /** Response body */
  data: T;
  /** Response status */
  status: number;
  /** Response status text */
  statusText: string;
}

/** Structure of HTTP Header */
export interface HttpHeader {
  /** Header name */
  name: string;
  /** Header value */
  value: string;
}

/** Typed wrapper around axios that standardizes making HTTP calls and handling responses */
export class HttpClient {
  /** Base axios instance this class will use */
  private client: AxiosInstance;
  private logger: Logger | undefined;

  /**
   * Typed wrapper around axios that standardizes making HTTP calls and handling responses
   * @param options Options that will be passed to axios
   */
  constructor (options?: HttpClientOptions) {
    this.client = axios.create(options);
  }

  /**
   * Sets the logger for the instance
   * @param {Logger|undefined} logger
   */
  public setLogger (logger: Logger | undefined) {
    this.logger = logger;
  }

  /** HTTP GET request */
  public get<T = unknown> (url: string, config: ApiConfig = {}, cancelToken?: AbortController): Promise<T> {
    const method: Method = 'get';
    return this.dataRequest<T>(url, method, config, cancelToken);
  }

  /** HTTP POST request */
  public post<T = unknown> (url: string, config: ApiConfig = {}, cancelToken?: AbortController): Promise<T> {
    const method: Method = 'post';
    return this.dataRequest<T>(url, method, config, cancelToken);
  }

  /** HTTP PUT request */
  public put<T = unknown> (url: string, config: ApiConfig = {}, cancelToken?: AbortController): Promise<T> {
    const method: Method = 'put';
    return this.dataRequest<T>(url, method, config, cancelToken);
  }

  /** HTTP DELETE request */
  public delete<T = unknown> (url: string, config: ApiConfig = {}, cancelToken?: AbortController): Promise<T> {
    const method: Method = 'delete';
    return this.dataRequest<T>(url, method, config, cancelToken);
  }

  /** HTTP PATCH request */
  public patch<T = unknown> (url: string, config: ApiConfig = {}, cancelToken?: AbortController): Promise<T> {
    const method: Method = 'patch';
    return this.dataRequest<T>(url, method, config, cancelToken);
  }

  /**
   *  HTTP request that returns the body of the HTTP response
   *
   *  If a cancel token is passed in it will be aborted on request error.
   *
   *  @returns {Promise<T>} body of the HTTP response
  */
  public async dataRequest<T = unknown> (url: string, method: Method, config: ApiConfig = {}, cancelToken?: AbortController): Promise<T> {
    try {
      const response = await this.request<T>(url, method, config, cancelToken);
      this.checkResponseStatus<T>(response);
      return response.data;
    } catch (e) {
      cancelToken?.abort();
      throw e;
    }
  }

  /**
   *  HTTP request
   *
   *  If a cancel token is passed in it will be aborted on request error.
   *
   *  @returns {Promise<HttpResponse<T>>} HttpResponse
  */
  public async request<T = unknown> (url: string, method: Method, config: ApiConfig = {}, cancelToken?: AbortController): Promise<HttpResponse<T>> {
    if (typeof url !== 'string')
      throw new Error(ERROR_URL);
    const { headers, data, params, responseEncoding, responseType } = config;
    const client = config.noGlobal ? axios.create() : this.client;
    const { CancelToken } = axios;
    const source = CancelToken.source();
    let hasCanceled = false;
    let hasResolvedRequest = false;

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
        // if signal is aborted then cancel the axios source
        source.cancel(ABORT_MESSAGE);
        hasCanceled = true;
      });
    }
    const axiosConfig: AxiosRequestConfig = {
      url, method, headers, data, params, responseType,
      cancelToken: source.token,
    };
    if (responseEncoding)
      (axiosConfig as any).responseEncoding = responseEncoding;
    this.logger?.debug(`HTTP Fetching - method: ${method}; url: ${url}`);

    const response = await client
      .request<T>(axiosConfig)
      .then((httpResponse) => {
        hasResolvedRequest = true;
        return httpResponse;
      })
      .catch((e) => {
        hasResolvedRequest = true;
        cancelToken?.abort();
        this.logger?.debug(`HTTP error - method: ${method}; url: ${url}`, e);
        throw e;
      });
    this.logger?.debug(`HTTP ${response.status} - method: ${method}; url: ${url}`);
    const formattedResponse: HttpResponse<T> = {
      data:       response.data,
      headers:    response.headers ?? {},
      status:     response.status,
      statusText: response.statusText,
    };
    return formattedResponse;
  }

  /** Add header to each HTTP request for this instance */
  public addGlobalApiHeader (header: HttpHeader) {
    const headers: Record<string, any> = this.client.defaults.headers!; // default headers should always exist
    headers.common[header.name] = header.value;
  }

  /** Add headers to each HTTP request for this instance */
  public addGlobalApiHeaders (headers: HttpHeader[]) {
    headers.forEach((header) => this.addGlobalApiHeader(header));
  }

  /** Validates the HTTP response is successful or throws an error */
  private checkResponseStatus<T = unknown> (response: HttpResponse<T>): HttpResponse<T> {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    throw response;
  }
}

import { IHttpClientAdaptor, Method, RequestConfig, ResponseType, HttpResponse } from './Adaptors';
import { HttpRequestStrategy, DefaultHttpRequestStrategy } from './HttpRequestStrategies';
import { Logger } from './Logger';
import { ERROR_URL } from './strings';

/** Config used for setting up http calls */
export interface ApiConfig {
  /** If specified, a new axios instance is used instead of the one instantiated in the HttpClient's constructor */
  noGlobal?: boolean;
  /** The headers that will be used in the HTTP call. Global headers will be added to these.
   *  // TODO: Test when noGlobal is true if global headers are added to the request
  */
  headers?: Record<string, string>;
  /** The body of the request that will be sent */
  data?: any;
  /** The type of response that will be expected */
  responseType?: ResponseType;
  /** The query parameters that will be sent with the HTTP call */
  params?: any;
  /** The encoding of the response */
  responseEncoding?: string;
  /** The strategy to use for this request, if not provided then the request that was provided with the HttpClient will be used */
  httpRequestStrategy?: HttpRequestStrategy;
}

/**
 * HttpClient configuration options
 */
export interface HttpClientOptions {
  /** The strategy that will be used to handle http requests */
  httpRequestStrategy?: HttpRequestStrategy,
  /** The logger the HttpClient will use */
  logger?: Logger,
  baseUrl?: string,
}

/** Typed wrapper around axios that standardizes making HTTP calls and handling responses */
export class HttpClient {
  private logger: Logger | undefined;
  private httpRequestStrategy: HttpRequestStrategy;
  private baseUrl: string;

  constructor (private httpClientAdaptor: IHttpClientAdaptor, options: HttpClientOptions = {}) {
    const { httpRequestStrategy, logger, baseUrl = '' } = options;
    this.httpRequestStrategy = httpRequestStrategy ?? new DefaultHttpRequestStrategy();
    this.logger = logger;
    this.baseUrl = baseUrl;
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
    const response = await this.request<T>(url, method, config, cancelToken);
    return response.data;
  }

  /**
   *  HTTP request
   *
   *  If a cancel token is passed in it will be aborted on request error.
   *
   *  @returns {Promise<HttpResponse<T>>} HttpResponse
  */
  public async request<T = unknown> (url: string, method: Method, config: ApiConfig = {}, cancelToken?: AbortController): Promise<HttpResponse<T>> {
    try {
      return await this.doRequest<T>(url, method, config, cancelToken);
    } catch (e) {
      cancelToken?.abort();
      throw e;
    }
  }

  private async doRequest<T = unknown> (url: string, method: Method, config: ApiConfig = {}, cancelToken?: AbortController): Promise<HttpResponse<T>> {
    if (typeof url !== 'string')
      throw new Error(ERROR_URL);
    const { headers, data, params, responseEncoding, responseType, httpRequestStrategy, noGlobal } = config;

    const strategyToUse = httpRequestStrategy ?? this.httpRequestStrategy;

    const requestConfig: RequestConfig = {
      url: this.baseUrl + url,
      method,
      headers,
      data,
      params,
      responseEncoding,
      responseType,
      cancelToken,
      noGlobal,
    };

    try {
      const request = this.httpClientAdaptor.buildRequest<T>(requestConfig);
      this.logger?.debug(`HTTP - method: ${method}; url: ${url}`);
      const response = await strategyToUse.request<T>(request);
      this.logger?.debug(`HTTP ${response.status} - method: ${method}; url: ${url}`);
      return response;
    } catch (e) {
      this.logger?.error(`HTTP error - method: ${method}; url: ${url}`, e);
      throw e;
    }
  }
}

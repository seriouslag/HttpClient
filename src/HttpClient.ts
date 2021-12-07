import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method, ResponseType } from 'axios';
import { AbortError } from './errors/AbortError';
import { Logger } from './Logger';
import { ABORT_MESSAGE, ERROR_URL } from './strings';
import { getIsSuccessfulHttpStatus } from './utilities/getIsSuccessfulHttpStatus';

export type HttpClientOptionType = 'baseURL' | 'headers' | 'withCredentials' | 'responseType' | 'xsrfCookieName' | 'xsrfHeaderName' | 'onUploadProgress' | 'onDownloadProgress' | 'httpAgent' | 'httpsAgent' | 'cancelToken';
export type SlimAxiosRequestConfig = Pick<AxiosRequestConfig, HttpClientOptionType>;

/** Config used for setting up http calls */
export interface ApiConfig {
  /** If specified, a new axios instance is used instead of the one instantiated in the HttpClient's constructor */
  noGlobal?: boolean;
  /** The headers that will be used in the HTTP call. Global headers will be added to these.
   *
   *  TODO - Test when noGlobal is true if global headers are added to the request
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
  /** The strategy used to handle requests */
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

/** How HTTP calls will be handled. */
export interface HttpRequestStrategy {
  /** Wrapper request around axios to add request and resposne logic */
  request: <T = unknown>(client: AxiosInstance, axiosConfig: AxiosRequestConfig) => Promise<AxiosResponse<T, any>>
}

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

/** Retrys HTTP requests immediatly on non successful HTTP request until the max retry count.
 *  Stops retrying when a TOO MANY REQUESTS STATUS is recieved (status code: 429)
 */
export class MaxRetryHttpRequestStrategy implements HttpRequestStrategy {

  /** TOO MANY REQUESTS STATUS CODE */
  private TOO_MANY_REQUESTS_STATUS = 429;

  /**
   * @param maxRetryCount - The maximum number of retries to attempt, default is 5, set to 0 for indefinite retries
   */
  constructor (private maxRetryCount: number = 5) {}

  public async request<T = unknown> (client: AxiosInstance, axiosConfig: AxiosRequestConfig): Promise<AxiosResponse<T, any>> {
    let response: AxiosResponse<T, any>;
    let retryCount = 0;
    let isSuccessfulHttpStatus = false;
    let isTooManyRequests = false;
    let isAtRetryLimit = false;

    const increment = this.maxRetryCount === 0 ? 0 : 1;
    do {
      response = await client.request<T>(axiosConfig);
      retryCount += increment;
      isSuccessfulHttpStatus = getIsSuccessfulHttpStatus(response.status);
      isTooManyRequests = response.status === this.TOO_MANY_REQUESTS_STATUS;
      isAtRetryLimit = retryCount > this.maxRetryCount;
    } while (!isSuccessfulHttpStatus && !isTooManyRequests && !isAtRetryLimit);
    return response;
  }
}

/**
 * HttpClient configuration options
 */
export interface HttpClientOptions {
  /** Options that will be passed to axios */
  axiosOptions?: SlimAxiosRequestConfig,
  /** The strategy that will be used to handle http requests */
  httpRequestStrategy?: HttpRequestStrategy,
  /** The logger the HttpClient will use */
  logger?: Logger,
}

/** Typed wrapper around axios that standardizes making HTTP calls and handling responses */
export class HttpClient {
  /** Base axios instance this class will use */
  private client: AxiosInstance;
  private logger: Logger | undefined;
  private httpRequestStrategy: HttpRequestStrategy;

  /**
   * Typed wrapper around axios that standardizes making HTTP calls and handling responses
   * @param axiosOptions Options that will be passed to axios
   */
  constructor (options: HttpClientOptions = {}) {
    const { axiosOptions, httpRequestStrategy, logger } = options;
    this.client = axios.create(axiosOptions);
    this.httpRequestStrategy = httpRequestStrategy ?? new DefaultHttpRequestStrategy();
    this.logger = logger;
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
    const { headers, data, params, responseEncoding, responseType } = config;
    // create new axios instance if noGlobal is passed
    const client = config.noGlobal ? axios.create() : this.client;
    const { CancelToken } = axios;
    // create axios cancel token
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
        // do not cancel if request is already resolved
        if (hasResolvedRequest)
          return;
        // if signal is aborted then cancel the axios source
        source.cancel(ABORT_MESSAGE);
        hasCanceled = true;
      });
    }
    const axiosConfig: AxiosRequestConfig = {
      url, method, headers, data, params, responseType,
      cancelToken:    source.token,
      // never have axios throw and error. Return request.
      validateStatus: () => true,
    };
    // axios for some reason does not allow the responseEncoding to be set
    if (responseEncoding)
      (axiosConfig as any).responseEncoding = responseEncoding;
    this.logger?.debug(`HTTP Fetching - method: ${method}; url: ${url}`);

    try {
      const response = await this.httpRequestStrategy.request<T>(client, axiosConfig);
      hasResolvedRequest = true;
      this.logger?.debug(`HTTP ${response.status} - method: ${method}; url: ${url}`);
      const formattedResponse: HttpResponse<T> = {
        data:       response.data,
        headers:    response.headers ?? {},
        status:     response.status,
        statusText: response.statusText,
      };
      return formattedResponse;
    } catch (e) {
      hasResolvedRequest = true;
      this.logger?.debug(`HTTP error - method: ${method}; url: ${url}`, e);
      throw e;
    }
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
}

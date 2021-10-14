import axios, { AxiosInstance, AxiosRequestConfig, Method, ResponseType } from 'axios';
import { Logger } from './Logger';
import { ERROR_URL } from './strings';

export type HttpClientOptionType = 'baseURL'|'headers'|'withCredentials'|'responseType'|'xsrfCookieName'|'xsrfHeaderName'|'onUploadProgress'|'onDownloadProgress'|'httpAgent'|'httpsAgent'|'cancelToken';
export type HttpClientOptions = Pick<AxiosRequestConfig, HttpClientOptionType>;

export interface ApiConfig {
  noGlobal?: boolean;
  headers?: any;
  data?: any;
  responseType?: ResponseType;
  params?: any;
  responseEncoding?: string;
}

export interface FetchResponse<T> {
  headers: any;
  data: T;
  status: number;
  statusText: string;
}

export interface ApiHeader {
  name: string;
  value: string;
}

export class HttpClient {
  private client: AxiosInstance;
  private logger: Logger|undefined;

  constructor (options?: HttpClientOptions) {
    this.client = axios.create(options);
  }

  public setLogger (logger: Logger|undefined) {
    this.logger = logger;
  }

  public get<T> (url: string, config: ApiConfig = {}, cancelToken?: AbortController): Promise<T> {
    const method = 'get';
    return this.api<T>(url, method, config, cancelToken);
  }

  public post<T>(url: string, config: ApiConfig = {}, cancelToken?: AbortController): Promise<T> {
    const method = 'post';
    return this.api<T>(url, method, config, cancelToken);
  }

  public put<T>(url: string, config: ApiConfig = {}, cancelToken?: AbortController): Promise<T> {
    const method = 'put';
    return this.api<T>(url, method, config, cancelToken);
  }

  public delete<T>(url: string, config: ApiConfig = {}, cancelToken?: AbortController): Promise<T> {
    const method = 'delete';
    return this.api<T>(url, method, config, cancelToken);
  }

  public patch<T>(url: string, config: ApiConfig = {}, cancelToken?: AbortController): Promise<T> {
    const method = 'patch';
    return this.api<T>(url, method, config, cancelToken);
  }

  public async api<T> (url: string, method: Method, config: ApiConfig = {}, cancelToken?: AbortController): Promise<T> {
    try {
      const response = await this.fetch<T>(url, method, config, cancelToken);
        this.checkResponseStatus<T>(response);
        return response.data;
      } catch (e) {
        cancelToken?.abort();
        throw e;
    }
  }

  public async fetch<T> (url: string, method: Method, config: ApiConfig = {}, cancelToken?: AbortController): Promise<FetchResponse<T>> {
    if (typeof url !== 'string')
      throw new Error(ERROR_URL);
    const { headers, data, params, responseEncoding, responseType } = config;
    const client = config.noGlobal ? axios.create() : this.client;
    const { CancelToken } = axios;
    const source = CancelToken.source();
    if (cancelToken) {
      // if signal is already aborted then cancel the axios source
      if (cancelToken.signal.aborted) {
        source.cancel('Aborted by token');
      }
      cancelToken.signal.addEventListener('abort', () => {
        // if signal is already aborted then cancel the axios source
        source.cancel('Aborted by token');
      })
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
      .catch((e) => {
        cancelToken?.abort();
        this.logger?.debug(`HTTP error - method: ${method}; url: ${url}`, e);
        throw e;
      });
    this.logger?.debug(`HTTP ${response.status} - method: ${method}; url: ${url}`);
    return {
      data: response.data,
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    };
  }

  public addGlobalApiHeader (header: ApiHeader) {
    const headers: Record<string, any> = this.client.defaults.headers!; //defauly headers should always exist
    headers.common[header.name] = header.value;
  }

  public addGlobalApiHeaders (headers: ApiHeader[]) {
    headers.forEach((header) => this.addGlobalApiHeader(header));
  }

  private checkResponseStatus<T> (response: FetchResponse<T>): FetchResponse<T> {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    throw response;
  }
}

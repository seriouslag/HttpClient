export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK';
export type ResponseType =
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'text'
  | 'stream';

/** Response data from using the fetch request */
export interface HttpResponse<T> {
  /** Response headers */
  headers: Record<string, string | undefined | null | number | boolean>;
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

export type RequestConfig = {
  url: string;
  method: Method;
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
  withCredentials?: boolean;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  cancelToken?: AbortController;
};

export interface Request<T = unknown> {
  do: () => Promise<HttpResponse<T>>;
}

export interface IHttpClientAdaptor {
  buildRequest: <T = unknown>(
    config: RequestConfig,
    cancelToken?: AbortController,
  ) => Request<T>;
  /** Add header to each HTTP request for this instance */
  addGlobalApiHeader: (header: HttpHeader) => void;

  /** Add headers to each HTTP request for this instance */
  addGlobalApiHeaders: (headers: HttpHeader[]) => void;
}

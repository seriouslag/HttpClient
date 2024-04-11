import {
  HttpHeader,
  HttpResponse,
  IHttpClientAdaptor,
  Request,
  RequestConfig,
} from './Adaptors';
import { AbortError } from './errors/AbortError';

type FetchRequestConfig = RequestConfig;

class FetchRequest<T> implements Request<T> {
  constructor(private config: FetchRequestConfig) {}

  public async do(): Promise<HttpResponse<T>> {
    try {
      const response = await fetch(this.config.url, {
        method: this.config.method,
        headers: this.config.headers,
        body: this.config.data ? JSON.stringify(this.config.data) : undefined,
        signal: this.config.cancelToken?.signal,
      });
      const headers: Record<
        string,
        string | undefined | null | number | boolean
      > = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      return {
        headers,
        data: response.body ? await response.json() : undefined,
        status: response.status,
        statusText: response.statusText,
      } satisfies HttpResponse<T>;
    } catch (error) {
      // if request is canceled then throw an abort error, keeps the error handling consistent
      // TODO: check if request was aborted then throw an AbortError
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new AbortError(error.message, {
          cause: error,
        });
      }
      throw error;
    }
  }
}

export class FetchClientAdaptor implements IHttpClientAdaptor {
  private globalHeaders: Map<string, string> = new Map();

  public buildRequest<T = unknown>(config: RequestConfig): Request<T> {
    return new FetchRequest<T>(config);
  }

  public addGlobalApiHeader(header: HttpHeader): void {
    this.globalHeaders.set(header.name, header.value);
  }

  public addGlobalApiHeaders(headers: HttpHeader[]): void {
    headers.forEach((header) => this.addGlobalApiHeader(header));
  }
}

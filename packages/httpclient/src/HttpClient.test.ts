import {
  HttpResponse,
  HttpClient,
  AbortError,
  LogFunction,
  Logger,
  DefaultHttpRequestStrategy,
} from './index';
import { mocked } from 'jest-mock';
import { ABORT_MESSAGE, ERROR_URL } from './strings';
import {
  HttpRequestStrategy,
  MaxRetryHttpRequestStrategy,
} from './HttpRequestStrategies';
import { Request } from './Adaptors';
import { FetchClientAdaptor } from './FetchClientAdaptor';

import 'jest-fetch-mock';
import { Sleep } from './utilities/sleep';

const logger: Logger = {
  debug: jest.fn() as LogFunction,
  info: jest.fn() as LogFunction,
  warn: jest.fn() as LogFunction,
  error: jest.fn() as LogFunction,
};

const mockedLogger = mocked(logger);

const responseData: Partial<HttpResponse<string>> = {
  data: 'data',
  status: 200,
  headers: {
    'content-type': 'text/plain;charset=UTF-8',
  },
  statusText: 'OK',
};

const buildMockOnce = (body: any | undefined, status: number) => () =>
  fetchMock.mockResponseOnce(body ? JSON.stringify(body) : '', {
    status,
  });

const mockOnceSuccess = buildMockOnce(responseData.data, 200);

const mockOnceFailure = () =>
  fetchMock.mockRejectOnce(new Error('TESTING ERROR'));

const mockSuccessDelay = (timeout: number = 100) =>
  fetchMock.mockResponseOnce(async () => {
    await Sleep(timeout);
    return {
      body: JSON.stringify(responseData.data),
      status: 200,
    };
  });

describe('HttpClient', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
    fetchMock.resetMocks();
  });

  it('constructs', () => {
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    expect(httpClient).toBeInstanceOf(HttpClient);
  });

  it('fetch - success', async () => {
    mockOnceSuccess();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const result = await httpClient.request('www.google.com', 'GET');
    expect.assertions(1);
    expect(result).toEqual(responseData);
  });

  it.skip('fetch - handles noGlobal option', async () => {
    const request = jest.fn((_config: any) => Promise.resolve(responseData));
    const httpClientAdaptor = new FetchClientAdaptor();
    const create = jest.fn().mockImplementation(() => {
      return { request };
    });
    mockOnceSuccess();
    const httpClient = new HttpClient(httpClientAdaptor);
    await httpClient.request('www.google.com', 'GET', {
      noGlobal: true,
    });
    expect.assertions(1);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('fetch - throws if no url is provided - undefined', async () => {
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    await expect(httpClient.request(undefined as any, 'GET')).rejects.toThrow(
      ERROR_URL,
    );
  });

  it('fetch - throws if no url is provided - null', async () => {
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    await expect(httpClient.request(null as any, 'GET')).rejects.toThrow(
      ERROR_URL,
    );
  });

  it('fetch - throws if no url is provided - number', async () => {
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    await expect(httpClient.request(1 as any, 'GET')).rejects.toThrow(
      ERROR_URL,
    );
  });

  it('fetch - throws if no url is provided - object', async () => {
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    await expect(httpClient.request({} as any, 'GET')).rejects.toThrow(
      ERROR_URL,
    );
  });

  it('get', async () => {
    mockOnceSuccess();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const result = await httpClient.get('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(responseData.data);
  });

  it('post', async () => {
    mockOnceSuccess();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const result = await httpClient.post('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(responseData.data);
  });

  it('delete', async () => {
    mockOnceSuccess();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const result = await httpClient.delete('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(responseData.data);
  });

  it('patch', async () => {
    mockOnceSuccess();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const result = await httpClient.patch('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(responseData.data);
  });

  it('put', async () => {
    mockOnceSuccess();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const result = await httpClient.put('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(responseData.data);
  });

  it('logger is not set when HttpClient is constructed', () => {
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    expect((httpClient as any).logger).toBeUndefined();
  });

  it('setLogger sets logger', () => {
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);

    expect.assertions(1);
    httpClient.setLogger(mockedLogger);
    expect((httpClient as any).logger).toEqual(mockedLogger);
  });

  it('fetch - if token is already aborted then axios call is aborted', async () => {
    const url = 'www.google.com';
    const method = 'get';
    const cancelToken = new AbortController();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    cancelToken.abort();
    expect.assertions(1);
    mockOnceSuccess();
    await expect(
      httpClient.request(url, method, {}, cancelToken),
    ).rejects.toThrow();
  });

  it('fetch - if token is already aborted then error is an AbortError', async () => {
    const url = 'www.google.com';
    const method = 'get';
    const cancelToken = new AbortController();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);

    cancelToken.abort();

    mockOnceSuccess();

    expect.assertions(2);
    try {
      await httpClient.request(url, method, {}, cancelToken);
    } catch (e) {
      const error = e as AbortError;
      expect(error).toBeInstanceOf(AbortError);
      expect(error.message).toEqual(ABORT_MESSAGE);
    }
  });

  it('fetch - if token is aborted after axios call, axios call is aborted', async () => {
    const url = 'www.google.com';
    const method = 'get';
    const cancelToken = new AbortController();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);

    mockSuccessDelay(2000);

    const promise = httpClient.request(url, method, {}, cancelToken);
    cancelToken.abort();

    expect.assertions(1);
    await expect(() => promise).rejects.toThrow();
  });

  it('fetch - if token is aborted after axios call, AbortError is throw', async () => {
    const url = 'www.google.com';
    const method = 'get';
    const cancelToken = new AbortController();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);

    mockSuccessDelay();
    const promise = httpClient.request(url, method, {}, cancelToken);
    cancelToken.abort();
    expect.assertions(1);
    await expect(() => promise).rejects.toThrow(AbortError);
  });

  it('fetch - if token is aborted after axios call is complete, axios call is completed', async () => {
    const url = 'www.google.com';
    const method = 'get';
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const cancelToken = new AbortController();
    mockOnceSuccess();

    const promise = httpClient.request(url, method, {}, cancelToken);
    await promise;
    cancelToken.abort();

    expect.assertions(1);
    const result = await promise;
    expect(result).toEqual(responseData);
  });

  it('fetch - rejected request, fails', async () => {
    mockOnceFailure();

    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const abort = jest.fn((_message?: string) => {});
    const cancelToken = new AbortController();
    const url = 'www.google.com';
    const method = 'get';

    cancelToken.abort = abort;
    expect.assertions(2);
    await expect(httpClient.request(url, method, {})).rejects.toThrow(
      'TESTING ERROR',
    );
    expect(abort).not.toHaveBeenCalled();
  });

  it('fetch - rejected request, fails, cancels token', async () => {
    mockOnceFailure();

    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const abort = jest.fn((_message?: string) => {});
    const cancelToken = new AbortController();
    const url = 'www.google.com';
    const method = 'get';

    cancelToken.abort = abort;
    expect.assertions(2);
    await expect(
      httpClient.request(url, method, {}, cancelToken),
    ).rejects.toThrow('TESTING ERROR');
    expect(abort).toHaveBeenCalledTimes(1);
  });

  it('Adds global headers', async () => {
    const httpClientAdaptor = new FetchClientAdaptor();
    httpClientAdaptor.addGlobalApiHeaders([
      {
        name: 'Name1',
        value: 'Value1',
      },
      {
        name: 'Name2',
        value: 'Value2',
      },
    ]);
    const globalHeaders = httpClientAdaptor['globalHeaders'];
    expect(globalHeaders.get('Name1')).toEqual('Value1');
    expect(globalHeaders.get('Name2')).toEqual('Value2');
  });

  it('api - throws error response when status is invalid', async () => {
    mockOnceFailure();

    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    expect(() =>
      httpClient.dataRequest('www.google.com', 'GET'),
    ).rejects.toThrow();
  });

  it('api - when status is invalid cancel token is aborted', async () => {
    mockOnceFailure();

    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);

    const abort = jest.fn((_message?: string) => {});
    const cancelToken = new AbortController();

    cancelToken.abort = abort;

    try {
      await httpClient.dataRequest('www.google.com', 'GET', {}, cancelToken);
    } catch (e) {
      expect(abort).toHaveBeenCalledTimes(1);
    }
  });

  it('fetch - logger is called before request is made', async () => {
    mockOnceSuccess();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    httpClient.setLogger(logger);
    expect.assertions(1);

    const promise = httpClient.request('www.google.com', 'GET');
    expect(logger.debug).toHaveBeenCalledTimes(1);
    await promise;
  });

  it('fetch - logger is called before request is made', async () => {
    mockOnceSuccess();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    httpClient.setLogger(logger);
    expect.assertions(1);

    await httpClient.request('www.google.com', 'GET');
    expect(logger.debug).toHaveBeenCalledTimes(2);
  });

  it('fetch - logger is called on error', async () => {
    mockOnceFailure();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    httpClient.setLogger(logger);
    expect.assertions(1);
    try {
      await httpClient.request('www.google.com', 'GET');
    } catch {
      expect(logger.error).toHaveBeenCalledTimes(1);
    }
  });

  it('httpRequestStrategy - uses default if no request is passed in', () => {
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect((httpClient as any).httpRequestStrategy).toBeInstanceOf(
      DefaultHttpRequestStrategy,
    );
  });

  it('httpRequestStrategy - uses strategy passed in constructor', () => {
    const strategy = new MaxRetryHttpRequestStrategy();
    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor, {
      httpRequestStrategy: strategy,
    });
    expect((httpClient as any).httpRequestStrategy).toBeInstanceOf(
      MaxRetryHttpRequestStrategy,
    );
  });

  it('httpRequestStrategy - uses strategy passed in request over one provided by HttpClient', async () => {
    expect.assertions(2);
    let httpClientStrategyCount = 0;
    let requestStrategyCount = 0;

    mockOnceSuccess();

    const httpClientStrategy: HttpRequestStrategy = {
      request: async <T = unknown>(request: Request<T>) => {
        httpClientStrategyCount += 1;
        const response = await request.do();
        return response;
      },
    };

    const requestStrategy: HttpRequestStrategy = {
      request: async <T = unknown>(request: Request<T>) => {
        requestStrategyCount += 1;
        const response = await request.do();
        return response;
      },
    };

    const httpClientAdaptor = new FetchClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor, {
      httpRequestStrategy: httpClientStrategy,
    });

    await httpClient.get('', {
      httpRequestStrategy: requestStrategy,
    });

    expect(httpClientStrategyCount).toEqual(0);
    expect(requestStrategyCount).toEqual(1);
  });
});

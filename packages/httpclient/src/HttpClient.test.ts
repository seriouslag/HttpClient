import { HttpResponse, HttpClient, ApiConfig, AbortError, LogFunction, Logger, DefaultHttpRequestStrategy } from './index';
import { mocked } from 'jest-mock';
import MockAdapter from 'axios-mock-adapter';
import { ABORT_MESSAGE, ERROR_URL } from './strings';
import { HttpRequestStrategy, MaxRetryHttpRequestStrategy } from './HttpRequestStrategies';
import { Request } from './Adaptors';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AxiosHttpClientAdaptor } from '@seriouslag/httpclient-axios';

const mock = new MockAdapter(axios, { delayResponse: 1000 });

const logger: Logger = {
  debug: jest.fn() as LogFunction,
  info:  jest.fn() as LogFunction,
  warn:  jest.fn() as LogFunction,
  error: jest.fn() as LogFunction,
};

const mockedLogger = mocked(logger);

const responseData: Partial<HttpResponse<string>> = {
  data:       'data',
  status:     200,
  headers:    {},
  statusText: undefined,
};

describe('HttpClient', () => {
  let create: (config?: AxiosRequestConfig<any> | undefined) => AxiosInstance;

  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
    mock.reset();
    create = axios.create;
  });

  afterEach(() => {
    axios.create = create;
  });

  it('constructs', () => {
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    expect(httpClient).toBeInstanceOf(HttpClient);
  });

  it('fetch - success', async () => {
    mock.onGet().reply(200, responseData.data);
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const result = await httpClient.request('www.google.com', 'GET');
    expect.assertions(1);
    expect(result).toEqual(responseData);
  });

  it('fetch - handles noGlobal option', async () => {
    const request = jest.fn((_config: any) => Promise.resolve(responseData));
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const create = jest.fn().mockImplementation(() => {
      return { request };
    });
    axios.create = create;
    mock.onGet().reply(200, responseData.data);
    const httpClient = new HttpClient(httpClientAdaptor);
    await httpClient.request('www.google.com', 'GET', {
      noGlobal: true,
    });
    expect.assertions(1);
    expect(create).toBeCalledTimes(1);
  });

  it('fetch - throws if no url is provided - undefined', async () => {
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    await expect(httpClient.request(undefined as any, 'GET')).rejects.toThrow(ERROR_URL);
  });

  it('fetch - throws if no url is provided - null', async () => {
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    await expect(httpClient.request(null as any, 'GET')).rejects.toThrow(ERROR_URL);
  });

  it('fetch - throws if no url is provided - number', async () => {
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    await expect(httpClient.request(1 as any, 'GET')).rejects.toThrow(ERROR_URL);
  });

  it('fetch - throws if no url is provided - object', async () => {
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    await expect(httpClient.request({} as any, 'GET')).rejects.toThrow(ERROR_URL);
  });

  it('get', async () => {
    mock.onGet().reply(200, responseData.data);
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const result = await httpClient.get('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(responseData.data);
  });

  it('post', async () => {
    mock.onPost().reply(200, responseData.data);
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const result = await httpClient.post('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(responseData.data);
  });

  it('delete', async () => {
    mock.onDelete().reply(200, responseData.data);
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const result = await httpClient.delete('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(responseData.data);
  });

  it('patch', async () => {
    mock.onPatch().reply(200, responseData.data);
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const result = await httpClient.patch('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(responseData.data);
  });

  it('put', async () => {
    mock.onPut().reply(200, responseData.data);
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const result = await httpClient.put('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(responseData.data);
  });

  it('logger is not set when HttpClient is constructed', () => {
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);
    expect((httpClient as any).logger).toBeUndefined();
  });

  it('setLogger sets logger', () => {
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);

    expect.assertions(1);
    httpClient.setLogger(mockedLogger);
    expect((httpClient as any).logger).toEqual(mockedLogger);
  });

  it('fetch - if token is already aborted then axios call is aborted', async () => {
    const cancel = jest.fn((_it: any) => { });
    const source = jest.fn(() => ({
      cancel,
      token: {
        throwIfRequested: jest.fn(),
      },
    }));
    (axios.CancelToken as any) = {
      source,
    };
    const url = 'www.google.com';
    const method = 'get';
    const cancelToken = new AbortController();
    const request = jest.fn((_config: any) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100);
      });
    });
    axios.create = jest.fn().mockImplementation(() => ({
      request,
    }));
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);

    cancelToken.abort();

    expect.assertions(2);
    await expect(httpClient.request(url, method, {}, cancelToken)).rejects.toThrow();
    expect(cancel).toBeCalledTimes(1);
  });

  it('fetch - if token is already aborted then error is an AbortError', async () => {
    const cancel = jest.fn((_it: any) => { });
    const source = jest.fn(() => ({
      cancel,
      token: {
        throwIfRequested: jest.fn(),
      },
    }));
    (axios.CancelToken as any) = {
      source,
    };
    const url = 'www.google.com';
    const method = 'get';
    const cancelToken = new AbortController();
    const request = jest.fn((_config: any) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100);
      });
    });
    axios.create = jest.fn().mockImplementation(() => ({
      request,
    }));
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);

    cancelToken.abort();

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
    const cancel = jest.fn((_it: any) => { });
    const source = jest.fn(() => ({
      cancel,
      token: {
        throwIfRequested: jest.fn(),
      },
    }));
    (axios.CancelToken as any) = {
      source,
    };
    const url = 'www.google.com';
    const method = 'get';
    const cancelToken = new AbortController();
    const request = jest.fn((_config: any) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100);
      });
    });
    axios.create = jest.fn().mockImplementation(() => ({
      request,
    }));
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);

    const promise = httpClient.request(url, method, {}, cancelToken);
    cancelToken.abort();

    expect.assertions(2);
    expect(cancel).toBeCalledTimes(1);
    try {
      await expect(() => promise).rejects.toThrow();
    } catch {
      fail('Should not get here');
    }
  });

  /** TODO: This is not working yet; Investigate https://github.com/ctimmerm/axios-mock-adapter/issues/59 */
  it.skip('fetch - if token is aborted after axios call, AbortError is throw', async () => {
    const cancel = jest.fn((_it: any) => { });
    const source = jest.fn(() => ({
      cancel,
      token: {
        throwIfRequested: jest.fn(),
      },
    }));
    (axios.CancelToken as any) = {
      source,
    };
    const url = 'www.google.com';
    const method = 'get';
    const cancelToken = new AbortController();
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);

    mock.onGet().reply(200, responseData.data);

    const promise = httpClient.request(url, method, {}, cancelToken);
    cancelToken.abort();

    expect.assertions(2);
    try {
      await promise;
    } catch (e) {
      const error = e as AbortError;
      expect(error).toBeInstanceOf(AbortError);
      expect(error.message).toEqual(ABORT_MESSAGE);
    }
  });

  it('fetch - if token is aborted after axios call is complete, axios call is completed', async () => {
    const cancel = jest.fn((_it: any) => { });
    const source = jest.fn(() => ({
      cancel,
      token: {
        throwIfRequested: jest.fn(),
      },
    }));
    (axios.CancelToken as any) = {
      source,
    };
    const url = 'www.google.com';
    const method = 'get';
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const cancelToken = new AbortController();
    mock.onGet().reply(200, responseData.data);

    const promise = httpClient.request(url, method, {}, cancelToken);
    await promise;
    cancelToken.abort();

    expect.assertions(2);
    expect(cancel).toBeCalledTimes(0);
    const result = await promise;
    expect(result).toEqual({
      data:       responseData.data,
      status:     200,
      headers:    {},
      statusText: undefined,
    });
  });

  it('fetch - if token is aborted twice then axios source is only canceled once', async () => {
    const cancel = jest.fn((_it: any) => { });
    const source = jest.fn(() => ({
      cancel,
      token: {
        throwIfRequested: jest.fn(),
      },
    }));
    (axios.CancelToken as any) = {
      source,
    };
    const url = 'www.google.com';
    const method = 'get';
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const cancelToken = new AbortController();
    const request = jest.fn((_config: any) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100);
      });
    });
    axios.create = jest.fn().mockImplementation(() => ({
      request,
    }));

    expect.assertions(1);
    const promise = httpClient.request(url, method, {}, cancelToken);
    // abort the token again
    cancelToken.abort();
    cancelToken.abort();
    try {
      await promise;
    } catch {
      // ignore error;
    }
    // cancel only be called once
    expect(cancel).toBeCalledTimes(1);
  });

  it('fetch - rejected request, fails', async () => {
    const cancel = jest.fn((_it: any) => { });
    const source = jest.fn(() => ({
      cancel,
      token: {
        throwIfRequested: jest.fn(),
      },
    }));
    (axios.CancelToken as any) = {
      source,
    };
    const request = jest.fn((_config: any) => {
      return Promise.reject('TESTING ERROR');
    });
    axios.create = jest.fn().mockImplementation(() => ({
      request,
    }));

    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const abort = jest.fn((_message?: string) => { });
    const cancelToken = new AbortController();
    const url = 'www.google.com';
    const method = 'get';

    cancelToken.abort = abort;
    expect.assertions(2);
    try {
      await httpClient.request(url, method, {});
    } catch (e) {
      expect(e).toEqual('TESTING ERROR');
    }
    expect(abort).not.toBeCalled();
  });

  it('fetch - rejected request, fails, cancels token', async () => {
    const cancel = jest.fn((_it: any) => { });
    const source = jest.fn(() => ({
      cancel,
      token: {
        throwIfRequested: jest.fn(),
      },
    }));
    (axios.CancelToken as any) = {
      source,
    };
    const request = jest.fn((_config: any) => {
      return Promise.reject('TESTING ERROR');
    });
    axios.create = jest.fn().mockImplementation(() => ({
      request,
    }));

    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    const abort = jest.fn((_message?: string) => { });
    const cancelToken = new AbortController();
    const url = 'www.google.com';
    const method = 'get';

    cancelToken.abort = abort;
    expect.assertions(2);
    try {
      await httpClient.request(url, method, {});
    } catch (e) {
      expect(e).toEqual('TESTING ERROR');
    }
    expect(abort).not.toBeCalled();
  });

  it('Adds global headers', async () => {
    (axios.CancelToken as any) = {
      source: () => jest.fn(() => ({})),
    };
    const common: { [name: string]: string } = {};
    const request = jest.fn((_config: any) => Promise.resolve(responseData));
    axios.create = jest.fn().mockImplementation(() => ({
      request,
      defaults: {
        headers: {
          common,
        },
      },
    }));

    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    httpClientAdaptor.addGlobalApiHeaders([{
      name:  'Name1',
      value: 'Value1'
    }, {
      name:  'Name2',
      value: 'Value2',
    }]);
    expect(common['Name1']).toEqual('Value1');
    expect(common['Name2']).toEqual('Value2');
  });

  it('fetch - responseEncoding is added to axios config when provided', async () => {
    const requestConfig: ApiConfig = {
      responseEncoding: 'test-encoding',
    };
    expect.assertions(1);
    const requestFn = jest.fn((config: any) => {
      expect(config.responseEncoding).toEqual(requestConfig.responseEncoding);
      return Promise.resolve(responseData);
    });
    axios.create = jest.fn().mockImplementation(() => ({
      request: requestFn,
    }));
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    await httpClient.request('www.google.com', 'GET', requestConfig);
  });

  it('api - throws error response when status is invalid', async () => {
    (axios.CancelToken as any) = {
      source: () => jest.fn(() => ({})),
    };
    const request = jest.fn((_config: any) => Promise.resolve({ ...responseData, status: 500 }));
    axios.create = jest.fn().mockImplementation(() => ({
      request,
    }));
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(2);
    try {
      await httpClient.dataRequest('www.google.com', 'GET');
    } catch (e) {
      expect(request).toBeCalledTimes(1);
      expect(request).toBeCalledWith({
        url:            'www.google.com',
        method:         'GET',
        data:           undefined,
        headers:        undefined,
        params:         undefined,
        cancelToken:    undefined,
        responseType:   undefined,
        validateStatus: expect.any(Function),
      });
    }
  });

  it('api - when status is invalid cancel token is aborted', async () => {
    (axios.CancelToken as any) = {
      source: () => jest.fn(() => ({})),
    };
    const request = jest.fn((_config: any) => Promise.resolve({ ...responseData, status: 500 }));
    axios.create = jest.fn().mockImplementation(() => ({
      request,
    }));
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect.assertions(1);

    const abort = jest.fn((_message?: string) => { });
    const cancelToken = new AbortController();

    cancelToken.abort = abort;

    try {
      await httpClient.dataRequest('www.google.com', 'GET', {}, cancelToken);
    } catch (e) {
      expect(abort).toBeCalledTimes(1);
    }
  });

  it('fetch - logger is called before request is made', async () => {
    mock.onGet().reply(200, responseData.data);
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    httpClient.setLogger(logger);
    expect.assertions(1);

    const promise = httpClient.request('www.google.com', 'GET');
    expect(logger.debug).toHaveBeenCalledTimes(1);
    await promise;
  });

  it('fetch - logger is called before request is made', async () => {
    mock.onGet().reply(200, responseData.data);
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    httpClient.setLogger(logger);
    expect.assertions(1);

    await httpClient.request('www.google.com', 'GET');
    expect(logger.debug).toHaveBeenCalledTimes(2);
  });

  it('fetch - logger is called on error', async () => {
    mock.onGet().networkError();
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
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
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor);
    expect((httpClient as any).httpRequestStrategy).toBeInstanceOf(DefaultHttpRequestStrategy);
  });

  it('httpRequestStrategy - uses strategy passed in constructor', () => {
    const strategy = new MaxRetryHttpRequestStrategy();
    const httpClientAdaptor = new AxiosHttpClientAdaptor();
    const httpClient = new HttpClient(httpClientAdaptor, {
      httpRequestStrategy: strategy,
    });
    expect((httpClient as any).httpRequestStrategy).toBeInstanceOf(MaxRetryHttpRequestStrategy);
  });

  it('httpRequestStrategy - uses strategy passed in request over one provided by HttpClient', async () => {
    expect.assertions(2);
    let httpClientStrategyCount = 0;
    let requestStrategyCount = 0;

    mock.onGet().reply(200, responseData.data);

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

    const httpClientAdaptor = new AxiosHttpClientAdaptor();
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

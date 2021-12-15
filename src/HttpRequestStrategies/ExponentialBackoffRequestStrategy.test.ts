import { ExponentialBackoffOptions, ExponentialBackoffRequestStrategy, HttpResponse } from '../index';
import MockAdapter from 'axios-mock-adapter';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const mock = new MockAdapter(axios, { delayResponse: 1000 });

const successfulResponseData: Partial<HttpResponse<string>> = {
  data:       'data',
  status:     200,
  headers:    {},
  statusText: undefined,
};

const failedResponseData: Partial<HttpResponse<string>> = {
  status:     400,
  headers:    {},
  statusText: undefined,
};

const tooManyRequestsResponseData: Partial<HttpResponse<string>> = {
  status:     429,
  headers:    {},
  statusText: undefined,
};


describe('ExponentialBackoffRequestStrategy', () => {
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

  it('be defined', () => {
    expect(new ExponentialBackoffRequestStrategy()).toBeDefined();
  });

  it('default maxRetryCount', () => {
    const strategy = new ExponentialBackoffRequestStrategy();
    expect((strategy as any).maxRetryCount).toEqual(5);
  });

  it('default delayFirstRequest', () => {
    const strategy = new ExponentialBackoffRequestStrategy();
    expect((strategy as any).delayFirstRequest).toEqual(false);
  });

  it('default baseDelay', () => {
    const strategy = new ExponentialBackoffRequestStrategy();
    expect((strategy as any).baseDelay).toEqual(100);
  });

  it('default factor', () => {
    const strategy = new ExponentialBackoffRequestStrategy();
    expect((strategy as any).factor).toEqual(2);
  });

  it('default maxDelay', () => {
    const strategy = new ExponentialBackoffRequestStrategy();
    expect((strategy as any).maxDelay).toEqual(-1);
  });

  it('accept options', () => {
    const maxRetryCount = 10;
    const delayFirstRequest = true;
    const baseDelay = 10;
    const factor = 3;
    const maxDelay = 100;
    const options: ExponentialBackoffOptions = {
      maxRetryCount,
      delayFirstRequest,
      baseDelay,
      factor,
      maxDelay,
    };
    const strategy = new ExponentialBackoffRequestStrategy(options);
    expect((strategy as any).maxRetryCount).toEqual(maxRetryCount);
    expect((strategy as any).delayFirstRequest).toEqual(delayFirstRequest);
    expect((strategy as any).baseDelay).toEqual(baseDelay);
    expect((strategy as any).factor).toEqual(factor);
    expect((strategy as any).maxDelay).toEqual(maxDelay);
  });

  it('request once on a success response', async () => {
    expect.assertions(2);
    const strategy = new ExponentialBackoffRequestStrategy();
    const request = jest.fn((_config: any) => Promise.resolve(successfulResponseData));
    const create = jest.fn().mockImplementation(() => ({ request }));
    axios.create = create;
    const client = axios.create();
    const axiosConfig: AxiosRequestConfig = {};

    const response = await strategy.request(client, axiosConfig);

    expect(successfulResponseData.data).toEqual(response.data);
    expect(client.request).toBeCalledTimes(1);
  });

  it('request until successful, 1 failed, 1 success, 5 max', async () => {
    expect.assertions(2);
    const strategy = new ExponentialBackoffRequestStrategy({ maxRetryCount: 5, factor: 0, baseDelay: 0 });

    let requestCount = 0;

    const request = jest.fn((_config: any) => {
      if (requestCount === 0) {
        requestCount += 1;
        return Promise.resolve(failedResponseData);
      }
      requestCount += 1;
      return Promise.resolve(successfulResponseData);
    });
    const create = jest.fn().mockImplementation(() => ({ request }));
    axios.create = create;
    const client = axios.create();
    const axiosConfig: AxiosRequestConfig = {};

    const response = await strategy.request(client, axiosConfig);

    expect(response.data).toEqual(successfulResponseData.data);
    expect(client.request).toBeCalledTimes(2);
  });

  it('request until maxRetryCount, 10 failed, 0 success, 10 max', async () => {
    expect.assertions(2);
    const maxRetryCount = 10;
    const strategy = new ExponentialBackoffRequestStrategy({ maxRetryCount, factor: 0, baseDelay: 0 });

    const request = jest.fn((_config: any) => {
      return Promise.resolve(failedResponseData);
    });
    const create = jest.fn().mockImplementation(() => ({ request }));
    axios.create = create;
    const client = axios.create();
    const axiosConfig: AxiosRequestConfig = {};

    const response = await strategy.request(client, axiosConfig);

    expect(response.data).toEqual(failedResponseData.data);
    expect(client.request).toBeCalledTimes(maxRetryCount);
  });

  it('request until hits TOO_MANY_REQUESTS_STATUS, 3 failed, 1 TOO_MANY..., 5 max', async () => {
    expect.assertions(2);
    const strategy = new ExponentialBackoffRequestStrategy({ maxRetryCount: 5, factor: 0, baseDelay: 0 });

    let requestCount = 0;

    const request = jest.fn((_config: any) => {
      if (requestCount === 3) {
        requestCount += 1;
        return Promise.resolve(tooManyRequestsResponseData);
      }
      requestCount += 1;
      return Promise.resolve(failedResponseData);
    });
    const create = jest.fn().mockImplementation(() => ({ request }));
    axios.create = create;
    const client = axios.create();
    const axiosConfig: AxiosRequestConfig = {};

    const response = await strategy.request(client, axiosConfig);

    expect(response.data).toEqual(tooManyRequestsResponseData.data);
    expect(client.request).toBeCalledTimes(4);
  });

  it('request forever if a zero is passed for maxRetryCount, 99 failed, 1 success..., 0 max', async () => {
    expect.assertions(2);
    const maxRetryCount = 0;
    const strategy = new ExponentialBackoffRequestStrategy({ maxRetryCount, factor: 0, baseDelay: 0 });

    let requestCount = 0;

    const request = jest.fn((_config: any) => {
      if (requestCount === 99) {
        requestCount += 1;
        return Promise.resolve(successfulResponseData);
      }
      requestCount += 1;
      return Promise.resolve(failedResponseData);
    });
    const create = jest.fn().mockImplementation(() => ({ request }));
    axios.create = create;
    const client = axios.create();
    const axiosConfig: AxiosRequestConfig = {};

    const response = await strategy.request(client, axiosConfig);

    expect(response.data).toEqual(successfulResponseData.data);
    expect(client.request).toBeCalledTimes(100);
  });

  it('first request is delayed with baseDelay if delayFirstRequest is passed', async () => {
    expect.assertions(2);
    const delayFirstRequest = true;
    const baseDelay = 1000;
    const strategy = new ExponentialBackoffRequestStrategy({
      delayFirstRequest,
      baseDelay,
    });
    const request = jest.fn((_config: any) => Promise.resolve(successfulResponseData));
    const create = jest.fn().mockImplementation(() => ({ request }));
    axios.create = create;
    const client = axios.create();
    const axiosConfig: AxiosRequestConfig = {};

    const then = Date.now();
    await strategy.request(client, axiosConfig);
    const now = Date.now();

    expect(now).toBeGreaterThan(then);
    expect(now - then).toBeGreaterThanOrEqual(baseDelay);
  });

  it('request will backoff based on baseDelay and factor, 3 failed, 1 sucess..., 5 max', async () => {
    expect.assertions(2);
    const delayFirstRequest = false;
    const baseDelay = 100;
    const factor = 1.25;
    const maxRetryCount = 5;
    const strategy = new ExponentialBackoffRequestStrategy({
      delayFirstRequest,
      baseDelay,
      factor,
      maxRetryCount,
    });

    let requestCount = 0;

    const request = jest.fn((_config: any) => {
      if (requestCount === 3) {
        requestCount += 1;
        return Promise.resolve(successfulResponseData);
      }
      requestCount += 1;
      return Promise.resolve(failedResponseData);
    });
    const create = jest.fn().mockImplementation(() => ({ request }));
    axios.create = create;
    const client = axios.create();
    const axiosConfig: AxiosRequestConfig = {};

    /**
     * 1st request: 0s
     * 2nd request: 100ms - baseDelay 100
     * 3rd request: 125ms - baseDelay 100 * factor 1.25 * retryCount 1
     * 4th request: 250ms - baseDelay 100 * factor 1.25 * retryCount 2
     * total: 475ms
     */

    const then = Date.now();
    await strategy.request(client, axiosConfig);
    const now = Date.now();

    expect(now).toBeGreaterThan(then);
    expect(now - then).toBeGreaterThanOrEqual(500);
  });

});

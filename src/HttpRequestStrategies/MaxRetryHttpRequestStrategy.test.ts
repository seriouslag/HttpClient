import { MaxRetryHttpRequestStrategy, HttpResponse } from '../index';
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

describe('MaxRetryHttpRequestStrategy', () => {

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
    expect(new MaxRetryHttpRequestStrategy()).toBeDefined();
  });

  it('default maxRetryCount', () => {
    const strategy = new MaxRetryHttpRequestStrategy();
    expect((strategy as any).maxRetryCount).toEqual(5);
  });

  it('accept a maxRetryCount', () => {
    const maxRetryCount = 10;
    const strategy = new MaxRetryHttpRequestStrategy(maxRetryCount);
    expect((strategy as any).maxRetryCount).toEqual(maxRetryCount);
  });

  it('request once on a success response', async () => {
    expect.assertions(2);
    const strategy = new MaxRetryHttpRequestStrategy();
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
    const strategy = new MaxRetryHttpRequestStrategy(5);

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
    const strategy = new MaxRetryHttpRequestStrategy(maxRetryCount);

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
    const strategy = new MaxRetryHttpRequestStrategy(5);

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
    const strategy = new MaxRetryHttpRequestStrategy(maxRetryCount);

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
});

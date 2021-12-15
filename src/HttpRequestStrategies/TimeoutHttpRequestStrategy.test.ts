import { TimeoutHttpRequestStrategy } from './TimeoutHttpRequestStrategy';
import MockAdapter from 'axios-mock-adapter';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { HttpResponse } from '../index';
import { Sleep } from '../utilities/sleep';

const mock = new MockAdapter(axios, { delayResponse: 1000 });

const successfulResponseData: Partial<HttpResponse<string>> = {
  data:       'data',
  status:     200,
  headers:    {},
  statusText: undefined,
};

describe('TimeoutHttpRequestStrategy', () => {

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
    expect(new TimeoutHttpRequestStrategy()).toBeDefined();
  });

  it('default timeout', () => {
    const strategy = new TimeoutHttpRequestStrategy();
    expect((strategy as any).timeout).toEqual(10000);
  });

  it('accept a timeout', () => {
    const timeout = 2000;
    const strategy = new TimeoutHttpRequestStrategy(timeout);
    expect((strategy as any).timeout).toEqual(timeout);
  });

  it('return on success response less than timeout', async () => {
    expect.assertions(1);
    const strategy = new TimeoutHttpRequestStrategy();
    const request = jest.fn((_config: any) => Promise.resolve(successfulResponseData));
    const create = jest.fn().mockImplementation(() => ({ request }));
    axios.create = create;
    const client = axios.create();
    const axiosConfig: AxiosRequestConfig = {};

    const response = await strategy.request(client, axiosConfig);

    expect(successfulResponseData.data).toEqual(response.data);
  });

  it('throw if request is longer than timeout', async () => {
    expect.assertions(2);
    const strategy = new TimeoutHttpRequestStrategy(100);

    const request = jest.fn(async (_config: any) => {
      await Sleep(200);
      return Promise.resolve(successfulResponseData);
    });
    const create = jest.fn().mockImplementation(() => ({ request }));
    axios.create = create;
    const client = axios.create();
    const axiosConfig: AxiosRequestConfig = {};
    try {
      await strategy.request(client, axiosConfig);
      fail('it will not reach here');
    } catch (e) {
      const error = e as Error;
      expect(error.message).toEqual('Request timed out');
    }
    expect(client.request).toBeCalledTimes(1);
  });
});

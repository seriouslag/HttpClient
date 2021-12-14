import { DefaultHttpRequestStrategy, HttpResponse } from '../index';
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

describe('DefaultHttpRequestStrategy', () => {

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

  it('should be defined', () => {
    expect(new DefaultHttpRequestStrategy()).toBeDefined();
  });

  it('request - successful', async () => {
    expect.assertions(2);
    const strategy = new DefaultHttpRequestStrategy();

    const request = jest.fn((_config: any) => Promise.resolve(successfulResponseData));
    const create = jest.fn().mockImplementation(() => ({ request }));
    axios.create = create;
    const client = axios.create();
    const axiosConfig: AxiosRequestConfig = {};

    const response = await strategy.request(client, axiosConfig);

    expect(successfulResponseData.data).toEqual(response.data);
    expect(client.request).toBeCalledTimes(1);
  });

  it('request - error - throws', async () => {
    expect.assertions(2);
    const strategy = new DefaultHttpRequestStrategy();

    const request = jest.fn((_config: any) => Promise.resolve(failedResponseData));
    const create = jest.fn().mockImplementation(() => ({ request }));
    axios.create = create;
    const client = axios.create();
    const axiosConfig: AxiosRequestConfig = {};


    await expect(() => strategy.request(client, axiosConfig)).rejects.toEqual(failedResponseData);
    expect(client.request).toBeCalledTimes(1);
  });
});

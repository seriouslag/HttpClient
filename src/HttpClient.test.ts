import axios from 'axios';
import { FetchResponse, HttpClient } from './HttpClient';
import { mocked } from 'ts-jest/utils';
import { MockedObject } from 'ts-jest/dist/utils/testing';
import { LogFunction, Logger } from './Logger';
import MockAdapter from 'axios-mock-adapter';
import { ERROR_URL } from './strings';

const mock = new MockAdapter(axios);

const mockedLogger: MockedObject<Logger> = mocked({
  debug: (() => jest.fn()) as LogFunction,
  info: (() => jest.fn()) as LogFunction,
  warn: (() => jest.fn()) as LogFunction,
  error: (() => jest.fn()) as LogFunction,
})

const requestData: Partial<FetchResponse<string>> = {
  data: 'data',
  status: 200,
};

describe('HttpClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mock.reset();
    (axios.CancelToken as any) = {
      source: () => jest.fn(() => ({})),
    };
  });

  it('constructs', () => {
    const httpClient = new HttpClient();
    expect.assertions(1);
    expect(httpClient).toBeInstanceOf(HttpClient);
  });

  it('fetch - success', async () => {
    mock.onGet().reply(200, requestData.data);
    const httpClient = new HttpClient();
    const result = await httpClient.fetch('www.url.com', 'GET');
    expect.assertions(1);
    expect(result).toEqual(requestData);
  });

  it('fetch - throws if no url is provided - undefined', async () => {
    const httpClient = new HttpClient();
    expect.assertions(1);
    await expect(httpClient.fetch(undefined as any, 'GET')).rejects.toThrow(ERROR_URL);
  });

  it('fetch - throws if no url is provided - null', async () => {
    const httpClient = new HttpClient();
    expect.assertions(1);
    await expect(httpClient.fetch(null as any, 'GET')).rejects.toThrow(ERROR_URL);
  });

  it('fetch - throws if no url is provided - number', async () => {
    const httpClient = new HttpClient();
    expect.assertions(1);
    await expect(httpClient.fetch(1 as any, 'GET')).rejects.toThrow(ERROR_URL);
  });

  it('fetch - throws if no url is provided - object', async () => {
    const httpClient = new HttpClient();
    expect.assertions(1);
    await expect(httpClient.fetch({} as any, 'GET')).rejects.toThrow(ERROR_URL);
  });

  it('get', async () => {
    mock.onGet().reply(200, requestData.data);
    const httpClient = new HttpClient();
    const result = await httpClient.get('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(requestData.data);
  });

  it('post', async () => {
    mock.onPost().reply(200, requestData.data);
    const httpClient = new HttpClient();
    const result = await httpClient.post('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(requestData.data);
  });

  it('delete', async () => {
    mock.onDelete().reply(200, requestData.data);
    const httpClient = new HttpClient();
    const result = await httpClient.delete('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(requestData.data);
  });

  it('patch', async () => {
    mock.onPatch().reply(200, requestData.data);
    const httpClient = new HttpClient();
    const result = await httpClient.patch('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(requestData.data);
  });

  it('put', async () => {
    mock.onPut().reply(200, requestData.data);
    const httpClient = new HttpClient();
    const result = await httpClient.put('www.google.com');

    expect.assertions(1);
    expect(result).toEqual(requestData.data);
  });

  it('setLogger sets logger', () => {
    const httpClient = new HttpClient();

    expect.assertions(2);
    expect((httpClient as any).logger).toBeUndefined();
    httpClient.setLogger(mockedLogger);
    expect((httpClient as any).logger).toEqual(mockedLogger);
  });
});

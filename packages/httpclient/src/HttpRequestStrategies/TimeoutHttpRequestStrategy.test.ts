import { TimeoutHttpRequestStrategy } from './TimeoutHttpRequestStrategy';
import { HttpResponse, Request } from '../index';
import { Sleep } from '../utilities/sleep';

const successfulResponseData: HttpResponse<string> = {
  data: 'data',
  status: 200,
  headers: {},
  statusText: 'success',
};

const failedResponseData: HttpResponse<undefined> = {
  data: undefined,
  status: 400,
  headers: {},
  statusText: 'Bad Request',
};

describe('TimeoutHttpRequestStrategy', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
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
    const doFn = jest.fn(() => Promise.resolve(successfulResponseData));

    const request: Request<any> = {
      do: doFn,
    };

    const response = await strategy.request(request);

    expect(successfulResponseData.data).toEqual(response.data);
  });

  it('throw if request is longer than timeout', async () => {
    expect.assertions(2);
    const strategy = new TimeoutHttpRequestStrategy(100);

    const doFn = jest.fn(async () => {
      await Sleep(200);
      return Promise.resolve(successfulResponseData);
    });
    const request: Request<any> = {
      do: doFn,
    };

    try {
      await strategy.request(request);
      throw new Error('it will not reach here');
    } catch (e) {
      const error = e as Error;
      expect(error.message).toEqual('Request timed out');
    }
    expect(doFn).toHaveBeenCalledTimes(1);
  });

  it('throw if request returns error', async () => {
    expect.assertions(2);
    const strategy = new TimeoutHttpRequestStrategy(100);

    const doFn = jest.fn(async () => {
      return Promise.reject(failedResponseData);
    });

    const request: Request<any> = {
      do: doFn,
    };

    try {
      await strategy.request(request);
      fail('it will not reach here');
    } catch (e) {
      const error = e as Partial<HttpResponse<string>>;
      expect(error.statusText).toEqual(failedResponseData.statusText);
    }
    expect(doFn).toHaveBeenCalledTimes(1);
  });
});

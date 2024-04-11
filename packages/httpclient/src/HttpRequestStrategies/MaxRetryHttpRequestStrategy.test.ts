import { MaxRetryHttpRequestStrategy, HttpResponse } from '../index';
import { Request } from '../Adaptors';

const successfulResponseData: HttpResponse<string> = {
  data: 'data',
  status: 200,
  headers: {},
  statusText: 'success',
};

const failedResponseData: HttpResponse<undefined> = {
  status: 400,
  headers: {},
  data: undefined,
  statusText: 'bad model',
};

const tooManyRequestsResponseData: HttpResponse<undefined> = {
  status: 429,
  headers: {},
  data: undefined,
  statusText: 'too many requests',
};

describe('MaxRetryHttpRequestStrategy', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
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
    const doFn = jest.fn(() => Promise.resolve(successfulResponseData));

    const request: Request<any> = {
      do: doFn,
    };

    const response = await strategy.request(request);

    expect(successfulResponseData.data).toEqual(response.data);
    expect(doFn).toHaveBeenCalledTimes(1);
  });

  it('request until successful, 1 failed, 1 success, 5 max', async () => {
    expect.assertions(2);
    const strategy = new MaxRetryHttpRequestStrategy(5);

    let requestCount = 0;

    const doFn = jest.fn(() => {
      if (requestCount === 0) {
        requestCount += 1;
        return Promise.resolve(failedResponseData);
      }
      requestCount += 1;
      return Promise.resolve(successfulResponseData);
    });
    const request: Request<any> = {
      do: doFn,
    };

    const response = await strategy.request(request);

    expect(response.data).toEqual(successfulResponseData.data);
    expect(doFn).toHaveBeenCalledTimes(2);
  });

  it('request until maxRetryCount, 10 failed, 0 success, 10 max', async () => {
    expect.assertions(2);
    const maxRetryCount = 10;
    const strategy = new MaxRetryHttpRequestStrategy(maxRetryCount);

    const doFn = jest.fn(() => {
      return Promise.resolve(failedResponseData);
    });
    const request: Request<any> = {
      do: doFn,
    };

    const response = await strategy.request(request);

    expect(response.data).toEqual(failedResponseData.data);
    expect(doFn).toHaveBeenCalledTimes(maxRetryCount);
  });

  it('request until hits TOO_MANY_REQUESTS_STATUS, 3 failed, 1 TOO_MANY..., 5 max', async () => {
    expect.assertions(2);
    const strategy = new MaxRetryHttpRequestStrategy(5);

    let requestCount = 0;

    const doFn = jest.fn(() => {
      if (requestCount === 3) {
        requestCount += 1;
        return Promise.resolve(tooManyRequestsResponseData);
      }
      requestCount += 1;
      return Promise.resolve(failedResponseData);
    });

    const request: Request<any> = {
      do: doFn,
    };

    const response = await strategy.request(request);

    expect(response.data).toEqual(tooManyRequestsResponseData.data);
    expect(doFn).toHaveBeenCalledTimes(4);
  });

  it('request forever if a zero is passed for maxRetryCount, 99 failed, 1 success..., 0 max', async () => {
    expect.assertions(2);
    const maxRetryCount = 0;
    const strategy = new MaxRetryHttpRequestStrategy(maxRetryCount);

    let requestCount = 0;

    const doFn = jest.fn(() => {
      if (requestCount === 99) {
        requestCount += 1;
        return Promise.resolve(successfulResponseData);
      }
      requestCount += 1;
      return Promise.resolve(failedResponseData);
    });
    const request: Request<any> = {
      do: doFn,
    };

    const response = await strategy.request(request);

    expect(response.data).toEqual(successfulResponseData.data);
    expect(doFn).toHaveBeenCalledTimes(100);
  });
});

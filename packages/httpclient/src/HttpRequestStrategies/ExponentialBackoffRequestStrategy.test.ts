import { ExponentialBackoffOptions, ExponentialBackoffRequestStrategy, HttpResponse } from '../index';
import { Request } from '../Adaptors';

const successfulResponseData: HttpResponse<string> = {
  data:       'data',
  status:     200,
  headers:    {},
  statusText: 'success',
};

const failedResponseData: HttpResponse<undefined> = {
  data:       undefined,
  status:     400,
  headers:    {},
  statusText: 'bad model',
};

const tooManyRequestsResponseData: HttpResponse<undefined> = {
  data:       undefined,
  status:     429,
  headers:    {},
  statusText: 'too manb requests',
};

describe('ExponentialBackoffRequestStrategy', () => {

  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
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
    const doFn = jest.fn(() => Promise.resolve(successfulResponseData));
    const request: Request<any> = {
      do: doFn,
    };

    const response = await strategy.request(request);

    expect(successfulResponseData.data).toEqual(response.data);
    expect(doFn).toBeCalledTimes(1);
  });

  it('request until successful, 1 failed, 1 success, 5 max', async () => {
    expect.assertions(2);
    const strategy = new ExponentialBackoffRequestStrategy({ maxRetryCount: 5, factor: 0, baseDelay: 0 });

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
    expect(doFn).toBeCalledTimes(2);
  });

  it('request until maxRetryCount, 10 failed, 0 success, 10 max', async () => {
    expect.assertions(2);
    const maxRetryCount = 10;
    const strategy = new ExponentialBackoffRequestStrategy({ maxRetryCount, factor: 0, baseDelay: 0 });

    const doFn = jest.fn(() => {
      return Promise.resolve(failedResponseData);
    });

    const request: Request<any> = {
      do: doFn,
    };

    const response = await strategy.request(request);

    expect(response.data).toEqual(failedResponseData.data);
    expect(doFn).toBeCalledTimes(maxRetryCount);
  });

  it('request until hits TOO_MANY_REQUESTS_STATUS, 3 failed, 1 TOO_MANY..., 5 max', async () => {
    expect.assertions(2);
    const strategy = new ExponentialBackoffRequestStrategy({ maxRetryCount: 5, factor: 0, baseDelay: 0 });

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
    expect(doFn).toBeCalledTimes(4);
  });

  it('request forever if a zero is passed for maxRetryCount, 99 failed, 1 success..., 0 max', async () => {
    expect.assertions(2);
    const maxRetryCount = 0;
    const strategy = new ExponentialBackoffRequestStrategy({ maxRetryCount, factor: 0, baseDelay: 0 });

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
    expect(doFn).toBeCalledTimes(100);
  });

  it('first request is delayed with baseDelay if delayFirstRequest is passed', async () => {
    expect.assertions(2);
    const delayFirstRequest = true;
    const baseDelay = 1000;
    const strategy = new ExponentialBackoffRequestStrategy({
      delayFirstRequest,
      baseDelay,
    });
    const doFn = jest.fn(() => Promise.resolve(successfulResponseData));

    const request: Request<any> = {
      do: doFn,
    };

    const then = Date.now();
    await strategy.request(request);
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

    const doFn = jest.fn(() => {
      if (requestCount === 3) {
        requestCount += 1;
        return Promise.resolve(successfulResponseData);
      }
      requestCount += 1;
      return Promise.resolve(failedResponseData);
    });
    const request: Request<any> = {
      do: doFn,
    };

    /**
     * 1st request: 0s
     * 2nd request: 100ms - baseDelay 100
     * 3rd request: 125ms - baseDelay 100 * factor 1.25 * retryCount 1
     * 4th request: 250ms - baseDelay 100 * factor 1.25 * retryCount 2
     * total: 475ms
     */

    const then = Date.now();
    await strategy.request(request);
    const now = Date.now();

    expect(now).toBeGreaterThan(then);

    const firstRequestTime = 0;
    const secondRequestTime = baseDelay;
    const thirdRequestTime = baseDelay * factor * 1;
    const forthRequestTime = baseDelay * factor * 2;
    // buffer is used to variance of tests
    const bufferTime = 25;

    const totalTime = firstRequestTime + secondRequestTime + thirdRequestTime + forthRequestTime + bufferTime;

    expect(now - then).toBeGreaterThanOrEqual(totalTime);
  });

  it('request will backoff based on maxDelay if maxDelay is lower than the retry algorithm, 3 failed, 1 sucess..., 5 max', async () => {
    expect.assertions(2);
    const delayFirstRequest = false;
    const baseDelay = 100;
    const factor = 1.25;
    const maxRetryCount = 5;
    const maxDelay = 10;
    const strategy = new ExponentialBackoffRequestStrategy({
      delayFirstRequest,
      baseDelay,
      factor,
      maxRetryCount,
      maxDelay,
    });

    let requestCount = 0;

    const doFn = jest.fn(() => {
      if (requestCount === 3) {
        requestCount += 1;
        return Promise.resolve(successfulResponseData);
      }
      requestCount += 1;
      return Promise.resolve(failedResponseData);
    });
    const request: Request<any> = {
      do: doFn,
    };

    /**
     * 1st request: 0s
     * 2nd request: 10ms - baseDelay 100 {maxDelay 10}
     * 3rd request: 10ms - baseDelay 100 * factor 1.25 * retryCount 1 {maxDelay 10}
     * 4th request: 10ms - baseDelay 100 * factor 1.25 * retryCount 2 {maxDelay 10}
     * total: ~30ms
     */

    const then = Date.now();
    await strategy.request(request);
    const now = Date.now();

    const firstRequestTime = 0;
    const secondRequestTime = maxDelay;
    const thirdRequestTime = maxDelay;
    const forthRequestTime = maxDelay;
    // buffer is used to variance of tests
    const bufferTime = 5;

    const totalTime = firstRequestTime + secondRequestTime + thirdRequestTime + forthRequestTime - bufferTime;

    expect(now).toBeGreaterThan(then);

    expect(now - then).toBeGreaterThanOrEqual(totalTime);
  });

});

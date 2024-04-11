import { DefaultHttpRequestStrategy, HttpResponse } from '../index';
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

describe('DefaultHttpRequestStrategy', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  it('be defined', () => {
    expect(new DefaultHttpRequestStrategy()).toBeDefined();
  });

  it('request - successful', async () => {
    expect.assertions(2);
    const strategy = new DefaultHttpRequestStrategy();

    const doFn = jest.fn(() => Promise.resolve(successfulResponseData));
    const request: Request<any> = {
      do: doFn,
    };

    const response = await strategy.request(request);

    expect(successfulResponseData.data).toEqual(response.data);
    expect(doFn).toHaveBeenCalledTimes(1);
  });

  it('request - error - throws', async () => {
    expect.assertions(2);
    const strategy = new DefaultHttpRequestStrategy();

    const doFn = jest.fn(() => Promise.resolve(failedResponseData));
    const request: Request<any> = {
      do: doFn,
    };

    await expect(() => strategy.request(request)).rejects.toEqual(
      failedResponseData,
    );
    expect(doFn).toHaveBeenCalledTimes(1);
  });
});

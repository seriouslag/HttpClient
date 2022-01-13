export class HttpError extends Error {
  public isHttpClientError = true;

  constructor (message: string) {
    super(message);
  }
}

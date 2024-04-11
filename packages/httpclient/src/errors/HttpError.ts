export class HttpError extends Error {
  public isHttpClientError = true;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

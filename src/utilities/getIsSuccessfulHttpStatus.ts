/** Function to determine if a HTTP status code is in the successful range (2XX) */
export function getIsSuccessfulHttpStatus (status: number): boolean {
  return status >= 200 && status < 300;
}

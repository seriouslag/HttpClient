/**
 * Sleeps for set amount of time (awaitable setTimeout)
 * @param milliseconds time to sleep in ms
 * @returns
 */
export function Sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

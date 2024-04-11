export type LogFunction = (message: string, ...args: unknown[]) => void;

/** Logger Interface */
export interface Logger {
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
  debug: LogFunction;
}

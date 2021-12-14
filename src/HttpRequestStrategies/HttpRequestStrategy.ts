import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/** How HTTP calls will be handled. */
export interface HttpRequestStrategy {
  /** Wrapper request around axios to add request and resposne logic */
  request: <T = unknown>(client: AxiosInstance, axiosConfig: AxiosRequestConfig) => Promise<AxiosResponse<T, any>>
}

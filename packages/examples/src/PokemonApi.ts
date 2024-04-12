import { HttpClient } from '@seriouslag/httpclient';
import { PokemonPage } from './types';

export class PokemonApi {
  private pageSize = 20;

  constructor(
    private baseUrl: string,
    private httpClient: HttpClient,
  ) {}

  /**
   * Fetches a page of Pokemon from the API.
   */
  public async fetchPokemonPage(
    cancelToken?: AbortController,
    offset: number = 0,
    pageSize: number = this.pageSize,
  ): Promise<PokemonPage> {
    const response = await this.httpClient.get<PokemonPage>(
      `${this.baseUrl}/pokemon`,
      {
        params: {
          offset: offset,
          limit: pageSize,
        },
      },
      cancelToken,
    );
    return response;
  }
}

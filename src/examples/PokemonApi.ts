import { HttpClient } from '../HttpClient';
import { PokemonPage } from './types';

export class PokemonApi {
  private pageSize = 20;

  constructor (private baseUrl: string, private httpClient: HttpClient) {}

  /** */
  public fetchPokemonPage (cancelToken?: AbortController, offset: number = 0, pageSize: number = this.pageSize): Promise<PokemonPage> {
    return this.httpClient.get<PokemonPage>(`${this.baseUrl}/pokemon`, {
      params: {
        offset: offset,
        limit:  pageSize,
      },
    }, cancelToken);
  }
}


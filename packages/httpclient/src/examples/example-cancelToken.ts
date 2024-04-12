import { HttpClient } from '../HttpClient';
import { PokemonApi } from '@seriouslag/examples';

const pokemonApiUrl = 'https://pokeapi.co/api/v2';

const httpClient = new HttpClient();
const pokemonApi = new PokemonApi(pokemonApiUrl, httpClient);

const cancelToken = new AbortController();

const main = async () => {
  // cancel the token before calling the api
  // token can be canceled after the after call has been called but before it resolves and the result will be the same; (abort error will be thrown)
  cancelToken.abort();
  try {
    const result = await pokemonApi.fetchPokemonPage(cancelToken);
    // Will not reach here
    console.log(result);
  } catch (e) {
    console.log('Request failed', e);
  }
};

main();

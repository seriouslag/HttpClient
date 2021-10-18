import { HttpClient } from '../HttpClient';
import { PokemonApi } from './PokemonApi';

const pokemonApiUrl = 'https://pokeapi.co/api/v2';

const httpClient = new HttpClient();
const pokemonApi = new PokemonApi(pokemonApiUrl, httpClient);

const cancelToken = new AbortController();

const main = async () => {
  // cancel the token before calling the api
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

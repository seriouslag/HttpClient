import { HttpClient } from '../HttpClient';
import { PokemonApi } from './PokemonApi';
import { Agent } from 'https';

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const pokemonApiUrl = 'https://pokeapi.co/api/v2';

const httpClientAdaptor = new AxiosClientAdaptor({
  httpsAgent,
});
const httpClient = new HttpClient(httpClientAdaptor);
const pokemonApi = new PokemonApi(pokemonApiUrl, httpClient);

const main = async () => {
  const result = await pokemonApi.fetchPokemonPage();
  console.log(result);
};

main();

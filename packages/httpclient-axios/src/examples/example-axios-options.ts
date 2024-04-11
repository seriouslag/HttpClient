import { HttpClient } from '@seriouslag/httpclient/src/HttpClient';
import { PokemonApi } from '@seriouslag/httpclient/src/examples/PokemonApi';
import { AxiosClientAdaptor } from '../index';
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

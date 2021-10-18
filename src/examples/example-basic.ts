import { HttpClient } from '../HttpClient';
import { PokemonApi } from './PokemonApi';

const pokemonApiUrl = 'https://pokeapi.co/api/v2';

const httpClient = new HttpClient();
const pokemonApi = new PokemonApi(pokemonApiUrl, httpClient);

const main = async () => {
  const result = await pokemonApi.fetchPokemonPage();
  console.log(result);
};

main();

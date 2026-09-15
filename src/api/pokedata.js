import axios from 'axios';

const POKEDATA_API_URL = 'https://api.pokedata.com/v2';

async function fetchPokeData(pokemonName) {
  try {
    const response = await axios.get(`${POKEDATA_API_URL}/pokemon/${pokemonName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Pokémon data for ${pokemonName}:`, error);
    throw error;
  }
}

async function fetchPokeDataList(limit = 20, offset = 0) {
  try {
    const response = await axios.get(`${POKEDATA_API_URL}/pokemon?limit=${limit}&offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Pokémon data list:', error);
    throw error;
  }
}

export { fetchPokeData, fetchPokeDataList };
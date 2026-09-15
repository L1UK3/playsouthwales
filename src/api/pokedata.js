```javascript
// Import axios for making HTTP requests
import axios from 'axios';

// Constants for the new API version and base URL
const POKEDATA_API_V2 = 'https://api.pokedata.com/v2';

// Function to fetch Pokémon data using the new API
export async function fetchPokemonData(pokemonName) {
  try {
    const response = await axios.get(`${POKEDATA_API_V2}/pokemon/${pokemonName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Pokémon data for ${pokemonName}:`, error);
    throw error;
  }
}

// Function to fetch Pokédex data using the new API
export async function fetchPokédexData() {
  try {
    const response = await axios.get(`${POKEDATA_API_V2}/pokédex`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Pokédex data:', error);
    throw error;
  }
}

// Example usage
// fetchPokemonData('pikachu').then(data => console.log(data));
// fetchPokédexData().then(data => console.log(data));
```
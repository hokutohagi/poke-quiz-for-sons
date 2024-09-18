import axios from 'axios';
// import { get } from 'node_modules/axios/index.cjs';

export const getRandomPokemonData = async () => {
    try {
      console.log('Starting getRandomPokemonData function');
    //   const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1');
    //   const totalPokemon = response.data.count;
      let randomId: number;
  
      let attempts = 0;
      const maxAttempts = 5;
  
      while (attempts < maxAttempts) {
        //   randomId = Math.floor(Math.random() * totalPokemon) + 1;
        randomId = Math.floor(Math.random() * 800) + 1;

          try {
          let pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
          let pokemonResponseData = pokemonResponse.data;
          let speciesResponse = await axios.get(pokemonResponseData.species.url);
          let speciesResponseData = speciesResponse.data;

          const pokeData = {
            id: pokemonResponseData.id,
            nameJp: pokemonResponseData.name,
            nameEn: pokemonResponseData.name,
            colorJp: speciesResponseData.color.name,
            colorEn: speciesResponseData.color.name,
            typeJp: pokemonResponseData.types[0].type.name,
            typeEn: pokemonResponseData.types[0].type.name,
            generaJp: speciesResponseData.genera[0].genus,
            generaEn: speciesResponseData.genera[0].genus,
            descritionJp: speciesResponseData.flavor_text_entries[0].flavor_text,
            image: pokemonResponseData.sprites.front_default,
            speciesData: speciesResponseData
          };
            
          return pokeData
  
        } catch (error) {
          attempts++;
          console.warn('Error occurred:', error);
          if (axios.isAxiosError(error)) {
            if (error.response) {
              console.warn(`Attempt ${attempts}: Received status ${error.response.status} for Pokemon ID ${randomId}.`);
            } else if (error.request) {
              console.warn(`Attempt ${attempts}: No response received for Pokemon ID ${randomId}.`);
            } else {
              console.warn(`Attempt ${attempts}: Error setting up the request for Pokemon ID ${randomId}.`);
            }
          } else {
            console.warn(`Attempt ${attempts}: Unexpected error occurred for Pokemon ID ${randomId}.`);
          }
          
          if (attempts >= maxAttempts) {
            console.error('Maximum attempts reached. Throwing error.');
            throw new Error('Failed to fetch a valid Pokemon after multiple attempts.');
          }
        }
      }
    } catch (error) {
      console.error('Error in getRandomPokemonData:', error);
      throw error;
    }
  };
  
  // デバッグ用の関数
  export const debugGetRandomPokemonData = async () => {
    try {
      console.log('Starting debugGetRandomPokemonData');
      const result = await getRandomPokemonData();
      console.log('Function completed successfully');
      console.log('Result:', result);
    } catch (error) {
      console.error('Function threw an error:', error);
    }
    console.log('debugGetRandomPokemonData finished');
  };

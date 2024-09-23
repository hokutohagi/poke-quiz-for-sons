import axios from 'axios';
import { PokemonData } from '../types/index';
// import { get } from 'node_modules/axios/index.cjs';

export const getRandomPokemonData = async () => {
    try {
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

            let colorResponse = await axios.get(speciesResponseData.color.url);
            let colorResponseData = colorResponse.data;

            // slot 1のタイプを取得
            let typeUrl = pokemonResponseData.types.find((type: any) => type.slot === 1).type.url;
            let typeResponse = await axios.get(typeUrl);
            let typeResponseData = typeResponse.data;

            const pokeData: PokemonData = {
                id: pokemonResponseData.id,
                name: {
                    jp: speciesResponseData.names.find((name: any) => name.language.name === 'ja-Hrkt')?.name || speciesResponseData.names[0].name,
                    en: pokemonResponseData.name
                },
                color: {
                    jp: colorResponseData.names.find((name: any) => name.language.name === 'ja-Hrkt')?.name || colorResponseData.names[0].name,
                    en: speciesResponseData.color.name
                },
                type: { // TODO: 複数のタイプを持つポケモンがいるため、配列にする
                    jp: typeResponseData.names.find((name: any) => name.language.name === 'ja-Hrkt')?.name || typeResponseData.names[0].name,
                    en: typeResponseData.names.find((name: any) => name.language.name === 'en')?.name || typeResponseData.names[0].name
                },
                genera: {
                    jp: speciesResponseData.genera.find((genus: any) => genus.language.name === 'ja-Hrkt')?.genus || speciesResponseData.genera[0].genus,
                    en: speciesResponseData.genera.find((genus: any) => genus.language.name === 'en')?.genus || speciesResponseData.genera[0].genus
                },
                descriptionJp: speciesResponseData.flavor_text_entries.find((entry: any) => entry.language.name === 'ja-Hrkt')?.flavor_text || speciesResponseData.flavor_text_entries[0].flavor_text,
                image: pokemonResponseData.sprites.front_default
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

  export const getColors = async () => {
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon-color');
      // response.data.results のからランダムに4つの色を選ぶ
      const shuffledColors = response.data.results.sort(() => Math.random() - 0.5);
      const randomColors: Array<{ name: string; url: string }> = shuffledColors.slice(0, 4);
      // randomColors.url から色の名前を取得
      // 日本語と英語の名前を取得
      const colorData = await Promise.all(randomColors.map(async (color: any) => {
        const colorResponse = await axios.get(color.url);
        return {
          jp: (colorResponse.data.names.find((name: any) => name.language.name === 'ja-Hrkt')?.name || colorResponse.data.names[0].name).toLowerCase(),
          en: (colorResponse.data.names.find((name: any) => name.language.name === 'en')?.name || colorResponse.data.names[0].name).toLowerCase()
        };
      }));
      return colorData;
    } catch (error) {
      console.error('Error in getColors:', error);
      throw error;
    }
  };

export const getTypes = async () => {
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/type');
      // response.data.results のからランダムに4つの色を選ぶ
      const shuffledTypes = response.data.results.sort(() => Math.random() - 0.5);
      const randomTypes: Array<{ name: string; url: string }> = shuffledTypes.slice(0, 4);
      // randomColors.url から色の名前を取得
      // 日本語と英語の名前を取得
      const typeData = await Promise.all(randomTypes.map(async (type: any) => {
        const typeResponse = await axios.get(type.url);
        return {
          jp: (typeResponse.data.names.find((name: any) => name.language.name === 'ja-Hrkt')?.name || typeResponse.data.names[0].name).toLowerCase(),
          en: (typeResponse.data.names.find((name: any) => name.language.name === 'en')?.name || typeResponse.data.names[0].name).toLowerCase()
        };
      }));
      return typeData;
    } catch (error) {
      console.error('Error in getTypes:', error);
      throw error;
    }
  };

export const getGenera = async () => {
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/generation');
      return response.data.results;
    } catch (error) {
      console.error('Error in getGenera:', error);
      throw error
    }
};

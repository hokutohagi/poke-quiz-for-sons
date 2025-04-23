import axios from 'axios';
import { 
  PokemonData, 
  PokemonApiNameObject, 
  PokemonApiGenusObject, 
  PokemonApiFlavorTextEntry,
  PokemonApiTypeSlot,
  TranslatedName
} from '../types/index';

interface PokemonApiResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    [key: string]: any;
  };
  types: PokemonApiTypeSlot[];
  species: {
    name: string;
    url: string;
  };
}

interface PokemonSpeciesApiResponse {
  names: PokemonApiNameObject[];
  color: {
    name: string;
    url: string;
  };
  genera: PokemonApiGenusObject[];
  flavor_text_entries: PokemonApiFlavorTextEntry[];
}

interface PokemonTypeApiResponse {
  names: PokemonApiNameObject[];
}

interface PokemonColorApiResponse {
  names: PokemonApiNameObject[];
}

export const getRandomPokemonData = async (): Promise<PokemonData> => {
    try {
      // 最大800までのポケモンからランダムに選択
      let randomId: number;
      let attempts = 0;
      const maxAttempts = 5;
  
      while (attempts < maxAttempts) {
        randomId = Math.floor(Math.random() * 800) + 1;

        try {
            // ポケモン基本情報の取得
            const pokemonResponse = await axios.get<PokemonApiResponse>(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
            const pokemonResponseData = pokemonResponse.data;

            // 種族情報の取得
            const speciesResponse = await axios.get<PokemonSpeciesApiResponse>(pokemonResponseData.species.url);
            const speciesResponseData = speciesResponse.data;

            // 色情報の取得
            const colorResponse = await axios.get<PokemonColorApiResponse>(speciesResponseData.color.url);
            const colorResponseData = colorResponse.data;

            // タイプ情報の取得（現状は最初のタイプのみ）
            const primaryType = pokemonResponseData.types.find(type => type.slot === 1);
            
            if (!primaryType) {
              throw new Error(`No primary type found for Pokemon ID ${randomId}`);
            }
            
            const typeResponse = await axios.get<PokemonTypeApiResponse>(primaryType.type.url);
            const typeResponseData = typeResponse.data;

            // 言語に基づいて日本語名を取得
            const getJapaneseText = (names: PokemonApiNameObject[]): string => {
              return names.find(item => item.language.name === 'ja-Hrkt')?.name || names[0].name;
            };

            // 言語に基づいて英語名を取得
            const getEnglishText = (names: PokemonApiNameObject[]): string => {
              return names.find(item => item.language.name === 'en')?.name || names[0].name;
            };

            // ポケモンデータの構築
            const pokeData: PokemonData = {
                id: pokemonResponseData.id,
                name: {
                    jp: getJapaneseText(speciesResponseData.names),
                    en: pokemonResponseData.name
                },
                color: {
                    jp: getJapaneseText(colorResponseData.names),
                    en: speciesResponseData.color.name
                },
                type: { // TODO: 複数のタイプを持つポケモンがいるため、配列にする
                    jp: getJapaneseText(typeResponseData.names),
                    en: getEnglishText(typeResponseData.names).toLowerCase()
                },
                genera: {
                    jp: speciesResponseData.genera.find(genus => genus.language.name === 'ja-Hrkt')?.genus || speciesResponseData.genera[0].genus,
                    en: speciesResponseData.genera.find(genus => genus.language.name === 'en')?.genus || speciesResponseData.genera[0].genus
                },
                descriptionJp: speciesResponseData.flavor_text_entries.find(entry => entry.language.name === 'ja-Hrkt')?.flavor_text || speciesResponseData.flavor_text_entries[0].flavor_text,
                image: pokemonResponseData.sprites.front_default
            };
            
            return pokeData;
  
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

      // ループが終了しても結果が返らなかった場合
      throw new Error('Failed to fetch Pokemon data after multiple attempts');
    } catch (error) {
      console.error('Error in getRandomPokemonData:', error);
      throw error;
    }
  };

/**
 * 全てのポケモンの色のリストを取得し、その中からランダムに選択して
 * オプションとして使用するためのデータを生成します
 * @returns TranslatedName[] 日本語と英語の名前を含むオプションの配列
 */
export const getColors = async (): Promise<TranslatedName[]> => {
    try {
      // 色の一覧を取得
      interface ColorListResponse {
        results: PokemonApiResource[];
      }
      
      const response = await axios.get<ColorListResponse>('https://pokeapi.co/api/v2/pokemon-color');
      
      // ランダムに4つの色を選択
      const shuffledColors = [...response.data.results].sort(() => Math.random() - 0.5);
      const randomColors = shuffledColors.slice(0, 4);
      
      // 各色の詳細情報を取得
      const colorData = await Promise.all(randomColors.map(async (color) => {
        const colorResponse = await axios.get<PokemonColorApiResponse>(color.url);
        
        // 言語に基づいて名前を取得
        const getJapaneseText = (names: PokemonApiNameObject[]): string => {
          return names.find(item => item.language.name === 'ja-Hrkt')?.name || names[0].name;
        };
        
        const getEnglishText = (names: PokemonApiNameObject[]): string => {
          return names.find(item => item.language.name === 'en')?.name || names[0].name;
        };
        
        return {
          jp: getJapaneseText(colorResponse.data.names).toLowerCase(),
          en: getEnglishText(colorResponse.data.names).toLowerCase()
        };
      }));
      
      return colorData;
    } catch (error) {
      console.error('Error in getColors:', error);
      throw error;
    }
};

/**
 * 全てのポケモンのタイプのリストを取得し、その中からランダムに選択して
 * オプションとして使用するためのデータを生成します
 * @returns TranslatedName[] 日本語と英語の名前を含むオプションの配列
 */
export const getTypes = async (): Promise<TranslatedName[]> => {
    try {
      // タイプの一覧を取得
      interface TypeListResponse {
        results: PokemonApiResource[];
      }
      
      const response = await axios.get<TypeListResponse>('https://pokeapi.co/api/v2/type');
      
      // ランダムに4つのタイプを選択
      const shuffledTypes = [...response.data.results].sort(() => Math.random() - 0.5);
      const randomTypes = shuffledTypes.slice(0, 4);
      
      // 各タイプの詳細情報を取得
      const typeData = await Promise.all(randomTypes.map(async (type) => {
        const typeResponse = await axios.get<PokemonTypeApiResponse>(type.url);
        
        // 言語に基づいて名前を取得
        const getJapaneseText = (names: PokemonApiNameObject[]): string => {
          return names.find(item => item.language.name === 'ja-Hrkt')?.name || names[0].name;
        };
        
        const getEnglishText = (names: PokemonApiNameObject[]): string => {
          return names.find(item => item.language.name === 'en')?.name || names[0].name;
        };
        
        return {
          jp: getJapaneseText(typeResponse.data.names).toLowerCase(),
          en: getEnglishText(typeResponse.data.names).toLowerCase()
        };
      }));
      
      return typeData;
    } catch (error) {
      console.error('Error in getTypes:', error);
      throw error;
    }
};

/**
 * ポケモンの世代情報を取得します
 * @returns PokemonApiResource[] 世代情報の配列
 */
export const getGenera = async (): Promise<PokemonApiResource[]> => {
    try {
      interface GenerationListResponse {
        results: PokemonApiResource[];
      }
      
      const response = await axios.get<GenerationListResponse>('https://pokeapi.co/api/v2/generation');
      return response.data.results;
    } catch (error) {
      console.error('Error in getGenera:', error);
      throw error;
    }
};

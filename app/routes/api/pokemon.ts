import { json } from "@vercel/remix";
import type { LoaderFunctionArgs } from "@vercel/remix";
import axios from 'axios';
import { getJapaneseText, getEnglishText, handleApiError } from '~/utils/pokemon-utils';
import type {
  PokemonData,
  PokemonApiResponse,
  PokemonSpeciesApiResponse,
  PokemonTypeApiResponse,
  PokemonColorApiResponse
} from '~/types';

// 定数
const MAX_POKEMON_ID = 800;   // 取得対象のポケモンの最大ID
const MAX_ATTEMPT_COUNT = 5;  // API取得の最大試行回数

/**
 * ランダムなポケモンデータを取得するローダー関数
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  try {
    // IDが指定されている場合はそのポケモンを、ない場合はランダムなポケモンを取得
    const pokemonId = id ? parseInt(id, 10) : Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
    
    if (isNaN(pokemonId) || pokemonId < 1 || pokemonId > MAX_POKEMON_ID) {
      return json({ error: `Invalid Pokemon ID: ${id}` }, { status: 400 });
    }
    
    const pokemonData = await fetchPokemonData(pokemonId, 0);
    return json(pokemonData);
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);
    return json(
      { error: "Failed to fetch Pokemon data. Please try again." },
      { status: 500 }
    );
  }
};

/**
 * 再帰的にポケモンデータの取得を試行するヘルパー関数
 */
const fetchPokemonData = async (pokemonId: number, attemptCount: number): Promise<PokemonData> => {
  // 試行回数が上限を超えている場合はエラーをスロー
  if (attemptCount >= MAX_ATTEMPT_COUNT) {
    throw new Error(`Failed to fetch Pokemon data after ${MAX_ATTEMPT_COUNT} attempts.`);
  }

  try {
    // ポケモン基本情報の取得
    const pokemonResponse = await axios.get<PokemonApiResponse>(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
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
      throw new Error(`No primary type found for Pokemon ID ${pokemonId}`);
    }

    const typeResponse = await axios.get<PokemonTypeApiResponse>(primaryType.type.url);
    const typeResponseData = typeResponse.data;

    // ポケモンデータを構築
    return {
      id: pokemonResponseData.id,
      name: {
        jp: getJapaneseText(speciesResponseData.names),
        en: pokemonResponseData.name
      },
      color: {
        jp: getJapaneseText(colorResponseData.names),
        en: speciesResponseData.color.name
      },
      type: {
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
  } catch (error) {
    // 次の試行のために再帰的に呼び出し
    console.warn(`Attempt ${attemptCount + 1}: Error fetching Pokemon ID ${pokemonId}.`);
    return fetchPokemonData(pokemonId, attemptCount + 1);
  }
};

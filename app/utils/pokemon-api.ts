import axios from 'axios';
import {
  PokemonData,
  PokemonApiResponse,
  PokemonSpeciesApiResponse,
  PokemonTypeApiResponse,
  PokemonColorApiResponse,
  ColorListResponse,
  TypeListResponse,
  GenerationListResponse,
  TranslatedName
} from '../types/index';
import { getJapaneseText, getEnglishText, shuffleArray, handleApiError } from './pokemon-utils';

// 定数
const MAX_POKEMON_ID = 800;   // 取得対象のポケモンの最大ID
const MAX_ATTEMPT_COUNT = 5;  // API取得の最大試行回数
const OPTIONS_COUNT = 4;      // クイズの選択肢の数

/**
 * ランダムなポケモンデータを取得します
 *
 * @async
 * @function getRandomPokemonData
 * @description ランダムなポケモンIDを生成し、そのポケモンの詳細情報を複数のAPIエンドポイントから取得します
 * @returns {Promise<PokemonData>} ポケモンの詳細データを含むオブジェクト
 * @throws {Error} API呼び出しが失敗した場合や最大試行回数を超えた場合にエラーをスローします
 */
export const getRandomPokemonData = async (): Promise<PokemonData> => {
  try {
    return await fetchPokemonWithRetry(0);
  } catch (error) {
    // エラーを整形して再スロー
    throw handleApiError(error, 'getRandomPokemonData');
  }
};

/**
 * 再帰的にポケモンデータの取得を試行するヘルパー関数
 *
 * @async
 * @function fetchPokemonWithRetry
 * @param {number} attemptCount - 現在の試行回数
 * @returns {Promise<PokemonData>} ポケモンの詳細データを含むオブジェクト
 * @throws {Error} 最大試行回数を超えた場合または予期せぬエラーが発生した場合
 */
const fetchPokemonWithRetry = async (attemptCount: number): Promise<PokemonData> => {
  // 試行回数が上限を超えている場合はエラーをスロー
  if (attemptCount >= MAX_ATTEMPT_COUNT) {
    throw handleApiError(
      new Error(`Failed to fetch Pokemon data`),
      'fetchPokemonWithRetry',
      `${MAX_ATTEMPT_COUNT}回の試行後もポケモンデータの取得に失敗しました。`
    );
  }

  // ランダムなポケモンIDを生成（イミュータブル）
  const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;

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

    // ポケモンデータを不変なオブジェクトとして構築
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
  } catch (error) {
    // 次の試行回数（イミュータブルな値）
    const nextAttemptCount = attemptCount + 1;

    // エラーログの出力
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.warn(`Attempt ${nextAttemptCount}: Received status ${error.response.status} for Pokemon ID ${randomId}.`);
      } else if (error.request) {
        console.warn(`Attempt ${nextAttemptCount}: No response received for Pokemon ID ${randomId}.`);
      } else {
        console.warn(`Attempt ${nextAttemptCount}: Error setting up the request for Pokemon ID ${randomId}.`);
      }
    } else {
      console.warn(`Attempt ${nextAttemptCount}: Unexpected error occurred for Pokemon ID ${randomId}.`);
    }

    // 再帰的に次の試行を実行
    return fetchPokemonWithRetry(nextAttemptCount);
  }
};

/**
 * 全てのポケモンの色のリストを取得し、その中からランダムに選択して
 * オプションとして使用するためのデータを生成します
 *
 * @async
 * @function getColors
 * @description PokeAPIから色情報を取得し、ランダムに選んだ色の詳細を取得して返します
 * @returns {Promise<TranslatedName[]>} 日本語と英語の名前を含むオプションの配列
 * @throws {Error} API呼び出しが失敗した場合
 */
export const getColors = async (): Promise<TranslatedName[]> => {
    try {
      // 色の一覧を取得
      const response = await axios.get<ColorListResponse>('https://pokeapi.co/api/v2/pokemon-color');

      // ランダムに選択肢の数だけ色を選択
      const shuffledColors = shuffleArray(response.data.results);
      const randomColors = shuffledColors.slice(0, OPTIONS_COUNT);

      // 各色の詳細情報を取得
      const colorData = await Promise.all(randomColors.map(async (color) => {
        try {
          const colorResponse = await axios.get<PokemonColorApiResponse>(color.url);
          return {
            jp: getJapaneseText(colorResponse.data.names).toLowerCase(),
            en: getEnglishText(colorResponse.data.names).toLowerCase()
          };
        } catch (err) {
          // 個別の色情報取得時のエラーを処理
          throw handleApiError(err, 'getColors', `色情報の取得に失敗: ${color.name}`);
        }
      }));

      return colorData;
    } catch (error) {
      // エラーを整形して再スロー
      throw handleApiError(error, 'getColors');
    }
};

/**
 * 全てのポケモンのタイプのリストを取得し、その中からランダムに選択して
 * オプションとして使用するためのデータを生成します
 * @returns TranslatedName[] 日本語と英語の名前を含むオプションの配列
 * @throws Error API呼び出しが失敗した場合
 */
export const getTypes = async (): Promise<TranslatedName[]> => {
    try {
      // タイプの一覧を取得
      const response = await axios.get<TypeListResponse>('https://pokeapi.co/api/v2/type');

      // ランダムに選択肢の数だけタイプを選択
      const shuffledTypes = shuffleArray(response.data.results);
      const randomTypes = shuffledTypes.slice(0, OPTIONS_COUNT);

      // 各タイプの詳細情報を取得
      const typeData = await Promise.all(randomTypes.map(async (type) => {
        try {
          const typeResponse = await axios.get<PokemonTypeApiResponse>(type.url);
          return {
            jp: getJapaneseText(typeResponse.data.names).toLowerCase(),
            en: getEnglishText(typeResponse.data.names).toLowerCase()
          };
        } catch (err) {
          // 個別のタイプ情報取得時のエラーを処理
          throw handleApiError(err, 'getTypes', `タイプ情報の取得に失敗: ${type.name}`);
        }
      }));

      return typeData;
    } catch (error) {
      // エラーを整形して再スロー
      throw handleApiError(error, 'getTypes');
    }
};

/**
 * ポケモンの世代情報を取得します
 * @returns PokemonApiResource[] 世代情報の配列
 * @throws Error API呼び出しが失敗した場合
 */
export const getGenera = async (): Promise<PokemonApiResource[]> => {
    try {
      const response = await axios.get<GenerationListResponse>('https://pokeapi.co/api/v2/generation');
      // イミュータブルな配列を返す
      return [...response.data.results];
    } catch (error) {
      // エラーを整形して再スロー
      throw handleApiError(error, 'getGenera');
    }
};

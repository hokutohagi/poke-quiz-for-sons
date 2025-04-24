import { json } from "@vercel/remix";
import type { LoaderFunctionArgs } from "@vercel/remix";
import axios from 'axios';
import { getJapaneseText, getEnglishText, shuffleArray } from '~/utils/pokemon-utils';
import { QuizCategory, Option, TranslatedName, ColorListResponse, TypeListResponse, PokemonColorApiResponse, PokemonTypeApiResponse } from '~/types';

const REQUIRED_OPTIONS_COUNT = 4;

/**
 * クイズのオプションを取得するローダー関数
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const correctAnswerEn = url.searchParams.get('correctAnswerEn');
  const correctAnswerJp = url.searchParams.get('correctAnswerJp');
  
  if (!category || !correctAnswerEn || !correctAnswerJp) {
    return json({ error: "Missing required parameters" }, { status: 400 });
  }
  
  try {
    // カテゴリに応じたオプションを生成
    const correctAnswer: Option = { en: correctAnswerEn, jp: correctAnswerJp };
    
    let options: Option[] = [];
    switch (category) {
      case 'color':
        options = await generateColorOptions(correctAnswer);
        break;
      case 'type':
        options = await generateTypeOptions(correctAnswer);
        break;
      default:
        return json({ error: `Unsupported category: ${category}` }, { status: 400 });
    }
    
    return json({ options });
  } catch (error) {
    console.error(`Error generating options for ${category}:`, error);
    return json(
      { error: "Failed to generate options. Please try again." },
      { status: 500 }
    );
  }
};

/**
 * 色のオプションを生成する
 */
const generateColorOptions = async (correctAnswer: Option): Promise<Option[]> => {
  try {
    // 色の一覧を取得
    const response = await axios.get<ColorListResponse>('https://pokeapi.co/api/v2/pokemon-color');
    
    // ランダムに選択肢の数だけ色を選択
    const shuffledColors = shuffleArray(response.data.results);
    const randomColors = shuffledColors.slice(0, REQUIRED_OPTIONS_COUNT + 2); // 余分に取得
    
    // 各色の詳細情報を取得
    const colorData = await Promise.all(randomColors.map(async (color) => {
      const colorResponse = await axios.get<PokemonColorApiResponse>(color.url);
      return {
        jp: getJapaneseText(colorResponse.data.names).toLowerCase(),
        en: getEnglishText(colorResponse.data.names).toLowerCase()
      };
    }));
    
    // ユニークな選択肢を生成
    const uniqueOptionsSet = new Set<string>();
    const uniqueOptions: Option[] = [];
    
    // 正解を追加
    uniqueOptionsSet.add(correctAnswer.en);
    uniqueOptions.push(correctAnswer);
    
    // ランダムな色を追加
    for (const color of colorData) {
      if (uniqueOptionsSet.size >= REQUIRED_OPTIONS_COUNT) break;
      if (!uniqueOptionsSet.has(color.en)) {
        uniqueOptionsSet.add(color.en);
        uniqueOptions.push(color);
      }
    }
    
    // シャッフルして返す
    return shuffleArray(uniqueOptions);
  } catch (error) {
    console.error('Error in generateColorOptions:', error);
    throw error;
  }
};

/**
 * タイプのオプションを生成する
 */
const generateTypeOptions = async (correctAnswer: Option): Promise<Option[]> => {
  try {
    // タイプの一覧を取得
    const response = await axios.get<TypeListResponse>('https://pokeapi.co/api/v2/type');
    
    // ランダムに選択肢の数だけタイプを選択
    const shuffledTypes = shuffleArray(response.data.results);
    const randomTypes = shuffledTypes.slice(0, REQUIRED_OPTIONS_COUNT + 2); // 余分に取得
    
    // 各タイプの詳細情報を取得
    const typeData = await Promise.all(randomTypes.map(async (type) => {
      const typeResponse = await axios.get<PokemonTypeApiResponse>(type.url);
      return {
        jp: getJapaneseText(typeResponse.data.names).toLowerCase(),
        en: getEnglishText(typeResponse.data.names).toLowerCase()
      };
    }));
    
    // ユニークな選択肢を生成
    const uniqueOptionsSet = new Set<string>();
    const uniqueOptions: Option[] = [];
    
    // 正解を追加
    uniqueOptionsSet.add(correctAnswer.en);
    uniqueOptions.push(correctAnswer);
    
    // ランダムなタイプを追加
    for (const type of typeData) {
      if (uniqueOptionsSet.size >= REQUIRED_OPTIONS_COUNT) break;
      if (!uniqueOptionsSet.has(type.en)) {
        uniqueOptionsSet.add(type.en);
        uniqueOptions.push(type);
      }
    }
    
    // シャッフルして返す
    return shuffleArray(uniqueOptions);
  } catch (error) {
    console.error('Error in generateTypeOptions:', error);
    throw error;
  }
};

import { PokemonData, QuizCategory, Option } from '~/types';
import { getColors, getTypes, getGenera } from '~/utils/pokemon-api';

const REQUIRED_OPTIONS_COUNT = 4;

export const getRandomPokemon = (pokemonData: PokemonData[]): PokemonData => {
  const randomIndex = Math.floor(Math.random() * pokemonData.length);
  return pokemonData[randomIndex];
};

export const getRandomCategory = (quizCategories: QuizCategory[]): QuizCategory => {
  const randomIndex = Math.floor(Math.random() * quizCategories.length);
  return quizCategories[randomIndex];
};

// category と PokemonData を受け取り、category に応じた選択肢を生成する
// PokemonData に存在する category の値を正解として、それ以外の選択肢をランダムに生成する
export const generateOptions = async(category: QuizCategory, pokemonData: PokemonData): Promise<Option[]> => {
  const correctAnswer = pokemonData[category.en as keyof PokemonData] as Option;
  switch (category.en) {
    case 'color':
      return await generateColorOptions(correctAnswer, pokemonData);
    case 'type':
      return generateTypeOptions(correctAnswer, pokemonData);
    // case 'genera':
    //   return generateGeneraOptions(correctAnswer, pokemonData);
    default:
      return [];
  }
};

const generateColorOptions = async (correctAnswer: Option, pokemonData: PokemonData): Promise<Option[]> => {
  let colors;
  try {
    colors = await getColors();
  } catch (error) {
    console.error('Error in generateColorOptions:', error);
    throw error;
  }
  const randomColors = colors.map((color: { jp: string; en: string }) => ({ jp: color.jp, en: color.en }));

  // ユニークな選択肢を生成
  const uniqueOptionsSet = new Set<string>();
  const uniqueOptions: Option[] = [];

  // 正解を追加
  uniqueOptionsSet.add(correctAnswer.en);
  uniqueOptions.push(correctAnswer);

  // ランダムな色を追加
  for (const color of randomColors) {
    if (uniqueOptionsSet.size >= REQUIRED_OPTIONS_COUNT) break;
    if (!uniqueOptionsSet.has(color.en)) {
      uniqueOptionsSet.add(color.en);
      uniqueOptions.push(color);
    }
  }

  // ユニークなカラーが4つ未満であればエラーとして処理
  const uniqueColorCount = new Set(randomColors.map(color => color.en)).size;
  if (uniqueColorCount < REQUIRED_OPTIONS_COUNT) {
    throw new Error('Failed to generate unique color options.');
  }

  // ユニークな選択肢が4つ未満の場合、再度ランダムな色を追加
  while (uniqueOptionsSet.size < 4) {
    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    if (!uniqueOptionsSet.has(randomColor.en)) {
      uniqueOptionsSet.add(randomColor.en);
      uniqueOptions.push(randomColor);
    }
  }

  // シャッフルして返す
  return uniqueOptions.sort(() => 0.5 - Math.random());
};

const generateTypeOptions = async(correctAnswer: Option, pokemonData: PokemonData): Promise<Option[]> => {
  let types;
  try {
    types = await getTypes();
  } catch (error) {
    console.error('Error fetching Pokemon types:', error);
    throw new Error('Failed to fetch Pokemon types. Please try again later.');
  }
  const randomTypes = types.map((type: { jp: string; en: string }) => ({ jp: type.jp, en: type.en }));
  // ユニークな選択肢を生成
  const uniqueOptionsSet = new Set<string>();
  const uniqueOptions: Option[] = [];
  // 正解を追加
  uniqueOptionsSet.add(correctAnswer.en);
  uniqueOptions.push(correctAnswer);
  // ランダムなタイプを追加
  for (const type of randomTypes) {
    if (uniqueOptionsSet.size >= REQUIRED_OPTIONS_COUNT) break;
    if (!uniqueOptionsSet.has(type.en)) {
      uniqueOptionsSet.add(type.en);
      uniqueOptions.push(type);
    }
  }
  // ユニークなタイプが4つ未満であればエラーとして処理
  const uniqueTypeCount = new Set(randomTypes.map(type => type.en)).size;
  if (uniqueTypeCount < 4) {
    throw new Error('Failed to generate unique type options.');
  }
  // ユニークな選択肢が4つ未満の場合、再度ランダムなタイプを追加
  while (uniqueOptionsSet.size < REQUIRED_OPTIONS_COUNT) {
    const randomType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
    if (!uniqueOptionsSet.has(randomType.en)) {
      uniqueOptionsSet.add(randomType.en);
      uniqueOptions.push(randomType);
    }
  }
  // シャッフルして返す
  return uniqueOptions.sort(() => 0.5 - Math.random());
};

export const getProgressiveHint = (word: string, hintLevel: number): string => {
  const masks = ['＿', '○', '■', '★'];
  switch (hintLevel) {
    case 0:
      return '(????)';
    case 1:
      return `(${word[0]}???)`;
    case 2:
      return `(${word.split('').map((char, index) => 
        index % 2 === 0 ? char : masks[Math.floor(Math.random() * masks.length)]
      ).join('')})`;
    case 3:
      return `(${word})`;
    default:
      return `(${word})`;
  }
};

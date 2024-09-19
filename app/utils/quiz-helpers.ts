import { PokemonData, QuizCategory, Option } from '~/types';
import { getColors, getTypes, getGenera } from '~/utils/pokemon-api';

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
    // case 'type':
    //   return generateTypeOptions(correctAnswer, pokemonData);
    // case 'genera':
    //   return generateGeneraOptions(correctAnswer, pokemonData);
    default:
      return [];
  }
};

const generateColorOptions = async (correctAnswer: Option, pokemonData: PokemonData): Promise<Option[]> => {
  const colors = await getColors();
  const randomOptions = [correctAnswer, ...colors];
  return randomOptions.sort(() => 0.5 - Math.random());
};

export const getProgressiveHint = (word: string, hintLevel: number): string => {
  const masks = ['＿', '○', '■', '★'];
  switch (hintLevel) {
    case 0:
      return '????';
    case 1:
      return word[0] + '???';
    case 2:
      return word.split('').map((char, index) => 
        index % 2 === 0 ? char : masks[Math.floor(Math.random() * masks.length)]
      ).join('');
    case 3:
      return word;
    default:
      return word;
  }
};

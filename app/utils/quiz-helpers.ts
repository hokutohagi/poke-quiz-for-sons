import { PokemonData, QuizCategory } from '~/types';

export const getRandomPokemon = (pokemonData: PokemonData[]): PokemonData => {
  const randomIndex = Math.floor(Math.random() * pokemonData.length);
  return pokemonData[randomIndex];
};

export const getRandomCategory = (quizCategories: QuizCategory[]): QuizCategory => {
  const randomIndex = Math.floor(Math.random() * quizCategories.length);
  return quizCategories[randomIndex];
};

export const generateOptions = (correctAnswer: string, category: QuizCategory, pokemonData: PokemonData[]): string[] => {
  const allOptions = pokemonData.map(pokemon => pokemon[category.en as keyof PokemonData] as string);
  const uniqueOptions = [...new Set(allOptions)];
  const filteredOptions = uniqueOptions.filter(option => option !== correctAnswer);
  const randomOptions = filteredOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
  return [correctAnswer, ...randomOptions].sort(() => 0.5 - Math.random());
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

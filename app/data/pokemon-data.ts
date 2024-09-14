import { PokemonData, QuizCategory, Achievement } from '~/types';

export const pokemonData: PokemonData[] = [
  { id: 1, nameJp: 'フシギダネ', nameEn: 'Bulbasaur', color: 'Green', type: 'Grass', habitat: 'Grassland', shape: 'Quadruped', image: '/images/pokemon-23.svg' },
  { id: 4, nameJp: 'ヒトカゲ', nameEn: 'Charmander', color: 'Red', type: 'Fire', habitat: 'Mountain', shape: 'Upright', image: '/images/pokemon-23.svg' },
  { id: 7, nameJp: 'ゼニガメ', nameEn: 'Squirtle', color: 'Blue', type: 'Water', habitat: 'Waters-edge', shape: 'Upright', image: '/images/pokemon-23.svg' },
  { id: 25, nameJp: 'ピカチュウ', nameEn: 'Pikachu', color: 'Yellow', type: 'Electric', habitat: 'Forest', shape: 'Quadruped', image: '/images/pokemon-23.svg' },
];

export const quizCategories: QuizCategory[] = [
    { en: 'color', jp: 'いろ' },
    { en: 'type', jp: 'タイプ' },
    { en: 'habitat', jp: 'すみか' },
    { en: 'shape', jp: 'かたち' }
  ];
  
  export const japaneseTranslations: { [key: string]: string } = {
    'Green': 'みどり', 'Red': 'あか', 'Blue': 'あお', 'Yellow': 'きいろ',
    'Grass': 'くさ', 'Fire': 'ほのお', 'Water': 'みず', 'Electric': 'でんき',
    'Grassland': 'そうげん', 'Mountain': 'やま', 'Waters-edge': 'みずべ', 'Forest': 'もり',
    'Quadruped': 'よんほんあし', 'Upright': 'たちほう'
  };
  
  export const achievements: Achievement[] = [
    { streak: 3, title: "Pokémon Novice", message: "Great start! You're on your way to becoming a Pokémon Master!" },
    { streak: 5, title: "Pokémon Enthusiast", message: "Awesome job! Your Pokémon knowledge is growing fast!" },
    { streak: 10, title: "Pokémon Expert", message: "Incredible! You're showing true expertise in Pokémon!" },
    { streak: 15, title: "Pokémon Master", message: "Phenomenal! You've achieved Pokémon Master status!" },
    { streak: 20, title: "Legendary Pokémon Master", message: "Unbelievable! Your Pokémon wisdom is legendary!" }
  ];

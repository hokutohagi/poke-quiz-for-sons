import { QuizCategory, Achievement } from '~/types';

export const quizCategories: QuizCategory[] = [
    { en: 'color', jp: 'いろ' },
    { en: 'type', jp: 'タイプ' },
    { en: 'genera', jp: 'しゅるい' }
];
  
  export const achievements: Achievement[] = [
    { streak: 3, title: "Pokémon Novice", message: "Great start! You're on your way to becoming a Pokémon Master!" },
    { streak: 5, title: "Pokémon Enthusiast", message: "Awesome job! Your Pokémon knowledge is growing fast!" },
    { streak: 10, title: "Pokémon Expert", message: "Incredible! You're showing true expertise in Pokémon!" },
    { streak: 15, title: "Pokémon Master", message: "Phenomenal! You've achieved Pokémon Master status!" },
    { streak: 20, title: "Legendary Pokémon Master", message: "Unbelievable! Your Pokémon wisdom is legendary!" }
  ];

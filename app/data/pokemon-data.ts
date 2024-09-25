import { QuizCategory, Achievement } from '~/types';

export const quizCategories: QuizCategory[] = [
    { en: 'color', jp: 'いろ' },
    { en: 'type', jp: 'タイプ' },
    // { en: 'genera', jp: 'しゅるい' }
];
  
  export const achievements: Achievement[] = [
    { streak: 3, title: "ポケモンビギナー", message: "すごいね！ポケモンマスターへの一歩だよ！" },
    { streak: 5, title: "ポケモンファン", message: "やったね！ポケモンのことがもっとわかってきたね！" },
    { streak: 10, title: "ポケモンつう", message: "すごい！ポケモンのことをよく知ってるね！" },
    { streak: 15, title: "ポケモンマスター", message: "すごすぎる！ポケモンマスターになったよ！" },
    { streak: 20, title: "でんせつのポケモンマスター", message: "びっくり！きみはでんせつのポケモンマスターだよ！" }
  ];

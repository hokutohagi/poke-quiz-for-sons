export interface PokemonData {
    id: number;
    nameJp: string;
    nameEn: string;
    color: string;
    type: string;
    habitat: string;
    shape: string;
    image: string;
}
  
export interface QuizCategory {
    en: string;
    jp: string;
}
  
export interface Achievement {
    streak: number;
    title: string;
    message: string;
}

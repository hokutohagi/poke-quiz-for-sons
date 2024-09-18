export interface PokemonData {
    id: number;
    nameJp: string;
    nameEn: string;
    colorJp: string;
    colorEn: string;
    typeJp: string;
    typeEn: string;
    generaJp: string;
    generaEn: string;
    descriptionJp: string;
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

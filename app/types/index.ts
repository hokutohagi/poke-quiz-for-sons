export interface PokemonData {
    id: number;
    name: {
        jp: string;
        en: string;
    },
    color: {
        jp: string;
        en: string;
    },
    type: {
        jp: string;
        en: string;
    },
    genera: {
        jp: string;
        en: string;
    },
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

export interface Option {
    en: string;
    jp: string;
}

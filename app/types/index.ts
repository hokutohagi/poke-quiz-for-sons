// 基本的な翻訳名称を持つ構造
export interface TranslatedName {
    jp: string;
    en: string;
}

// PokeAPIから取得した結果を格納するデータ構造
export interface PokemonData {
    id: number;
    name: TranslatedName;
    color: TranslatedName;
    type: TranslatedName; // TODO: 後に配列に変更予定
    genera: TranslatedName;
    descriptionJp: string;
    image: string;
}

// PokeAPI関連の型定義
export interface PokemonApiNameObject {
    name: string;
    language: {
        name: string;
        url: string;
    };
}

export interface PokemonApiGenusObject {
    genus: string;
    language: {
        name: string;
        url: string;
    };
}

export interface PokemonApiFlavorTextEntry {
    flavor_text: string;
    language: {
        name: string;
        url: string;
    };
    version: {
        name: string;
        url: string;
    };
}

export interface PokemonApiTypeSlot {
    slot: number;
    type: {
        name: string;
        url: string;
    };
}

export interface PokemonApiResource {
    name: string;
    url: string;
}

// クイズ関連の型定義
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

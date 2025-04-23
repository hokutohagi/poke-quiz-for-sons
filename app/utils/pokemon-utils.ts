import { PokemonApiNameObject } from '~/types';

/**
 * 日本語名を取得するためのユーティリティ関数
 * @param names 名前のリスト
 * @returns 日本語名（見つからない場合は最初の名前）
 */
export const getJapaneseText = (names: PokemonApiNameObject[]): string => {
  return names.find(item => item.language.name === 'ja-Hrkt')?.name || names[0].name;
};

/**
 * 英語名を取得するためのユーティリティ関数
 * @param names 名前のリスト
 * @returns 英語名（見つからない場合は最初の名前）
 */
export const getEnglishText = (names: PokemonApiNameObject[]): string => {
  return names.find(item => item.language.name === 'en')?.name || names[0].name;
};

/**
 * 配列をランダムにシャッフルする
 * @param array シャッフルする配列
 * @returns シャッフルされた配列のコピー
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

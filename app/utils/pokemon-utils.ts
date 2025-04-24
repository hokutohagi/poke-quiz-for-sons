import axios from 'axios';
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
 * 配列をシャッフルするユーティリティ関数
 * Fisher-Yates（Knuth）シャッフルアルゴリズムを使用
 *
 * @param array シャッフルする配列
 * @returns シャッフルされた配列のコピー
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * 一貫したエラーハンドリングのためのユーティリティ関数
 *
 * @param error 発生したエラー
 * @param functionName エラーが発生した関数名
 * @param additionalInfo 追加情報（オプション）
 * @returns 整形されたエラーオブジェクト
 */
export const handleApiError = (error: unknown, functionName: string, additionalInfo?: string): Error => {
  // ログの記録
  console.error(`Error in ${functionName}:`, error);

  // エラーメッセージの構築
  let errorMessage = `API呼び出し中にエラーが発生しました (${functionName})`;

  if (additionalInfo) {
    errorMessage += `: ${additionalInfo}`;
  }

  // Axiosエラーの場合、詳細情報を追加
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // サーバーからのレスポンスがあるがエラーステータスの場合
      errorMessage += ` - サーバーから ${error.response.status} エラーが返されました`;
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない場合
      errorMessage += ' - サーバーからの応答がありませんでした';
    } else {
      // リクエスト設定中にエラーが発生した場合
      errorMessage += ' - リクエスト設定中にエラーが発生しました';
    }
  }

  // 元のエラーメッセージがある場合は追加
  if (error instanceof Error) {
    errorMessage += `: ${error.message}`;
  }

  return new Error(errorMessage);
};

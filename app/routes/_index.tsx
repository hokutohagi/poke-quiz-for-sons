import type { MetaFunction } from "@vercel/remix";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "ポケモンクイズ for Sons" },
    { description: "子供向けのバイリンガル（英語・日本語）ポケモンクイズアプリケーション" },
  ];
};

export default function Index() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">ポケモンクイズ for Sons</h1>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <p className="mb-4">
          子供向けのバイリンガル（英語・日本語）ポケモンクイズアプリケーションです。
          ポケモンの特徴を学びながら、楽しく日本語も覚えられるように設計されています。
        </p>
        <div className="flex justify-center mb-6">
          <img 
            src="/images/pokemon-23.svg" 
            alt="ポケモンクイズ" 
            className="w-32 h-32"
          />
        </div>
        <div className="flex justify-center">
          <Link 
            to="/quiz" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            クイズをはじめる
          </Link>
        </div>
      </div>
    </div>
  );
}

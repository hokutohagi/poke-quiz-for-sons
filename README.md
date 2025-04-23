# ポケモンクイズ for Sons

子供向けのバイリンガル（英語・日本語）ポケモンクイズアプリケーションです。ポケモンの特徴を学びながら、楽しく日本語も覚えられるように設計されています。

![ポケモンクイズ](/public/images/pokemon-23.svg)

## アプリケーション概要

このアプリケーションは、主に子供向けに設計された教育的なポケモンクイズゲームで、日本語学習に焦点を当てています。アプリはユーザーにポケモンのキャラクターを提示し、色やタイプなどの属性について英語と日本語の両方で質問します。

## 主な機能

### 1. バイリンガルなクイズ体験
- 質問と回答は英語と日本語の両方で表示
- 子供の理解しやすさを考慮して日本語のひらがな表記を使用
- 両言語でのテキスト読み上げによる音声サポート

### 2. 教育的要素
- ポケモンの特徴（色、タイプ）を二か国語で学習
- 日本語の文字を徐々に明らかにするヒントシステム
- 継続的な学習を促す達成システム

### 3. ゲームメカニクス
- PokeAPIからのランダムなポケモン選択（最初の800ポケモンに限定）
- 4つの選択肢による多肢選択形式
- 正解の連続回数に基づく達成レベル：
  - ポケモンビギナー：3回正解
  - ポケモンファン：5回正解
  - ポケモンつう：10回正解
  - ポケモンマスター：15回正解
  - でんせつのポケモンマスター：20回正解

## インストール方法

このアプリケーションをローカル環境で実行するための手順です。

### 前提条件

- Node.js (v18.20.4) のインストール
- npmまたはyarn

### セットアップ手順

1. リポジトリをクローンします
```bash
git clone https://github.com/yourusername/poke-quiz-for-sons.git
cd poke-quiz-for-sons
```

2. 依存関係をインストールします
```bash
npm install
# または
yarn install
```

3. 開発サーバーを起動します
```bash
npm run dev
# または
yarn dev
```

4. ブラウザで `http://localhost:3000` にアクセスしてアプリケーションを使用します

## 技術スタック

- **フレームワーク**: Remix.js (Remix Run v2.10.0)
- **UIフレームワーク**: React.js (v18.2.0)
- **スタイリング**: TailwindCSS (v3.4.11)
- **UIコンポーネント**: Radix UI プリミティブを使用したカスタムコンポーネント
- **API連携**: PokeAPI (axiosを使用してポケモンデータを取得)
- **言語サポート**: バイリンガルインターフェース（英語と日本語）
- **音声合成**: ブラウザのSpeechSynthesisUtterance APIを使用

## プロジェクト構造

```
poke-quiz-for-sons/
├── app/
│   ├── components/      # アプリケーションのUIコンポーネント
│   │   ├── pokemon-quiz.tsx  # メインのクイズコンポーネント
│   │   └── ui/          # UIコンポーネント（ボタン、カードなど）
│   ├── data/            # アプリケーションデータ
│   │   └── pokemon-data.ts  # クイズカテゴリと達成度データ
│   ├── routes/          # アプリケーションのルート
│   │   └── _index.tsx   # メインページ
│   ├── styles/          # CSSスタイル
│   ├── types/           # TypeScriptの型定義
│   └── utils/           # ユーティリティ関数
│       ├── pokemon-api.ts  # PokeAPIとの連携
│       └── quiz-helpers.ts # クイズ生成ヘルパー
├── public/              # 静的ファイル
│   └── images/          # 画像
├── package.json         # プロジェクト依存関係
└── README.md            # このファイル
```

## 開発方法

### 新しいクイズカテゴリの追加

`app/data/pokemon-data.ts` ファイルを編集して、新しいクイズカテゴリを追加できます。

```typescript
export const quizCategories: QuizCategory[] = [
    { en: 'color', jp: 'いろ' },
    { en: 'type', jp: 'タイプ' },
    // 新しいカテゴリを追加
    { en: 'habitat', jp: 'すみか' }
];
```

新しいカテゴリを追加する場合は、`app/utils/quiz-helpers.ts` の `generateOptions` 関数にも対応するオプション生成ロジックを追加する必要があります。

### カスタマイズ

- **UIのカスタマイズ**: `app/styles/globals.css` と各UIコンポーネントを編集
- **クイズの難易度調整**: `app/utils/pokemon-api.ts` の `getRandomPokemonData` 関数を調整して、使用するポケモンの範囲を変更
- **達成度の変更**: `app/data/pokemon-data.ts` の `achievements` 配列を編集

## デプロイ

このアプリケーションはGitHubリポジトリとVercelが連携されており、自動デプロイが設定されています。

### 自動デプロイ

1. GitHubでプルリクエストを作成すると、Vercelによって自動的にPreview環境がデプロイされます。これにより、変更内容を本番環境に適用する前に確認することができます。

2. プルリクエストがマージされると、Vercelは自動的に変更を本番環境にデプロイします。これにより、常に`main`ブランチの最新コードが本番環境で実行されます。

3. デプロイの進行状況とステータスはGitHubのコミット/PRチェックおよびVercelのダッシュボードで確認できます。

### 手動デプロイ（必要な場合）

特別な設定が必要な場合、Vercelダッシュボードから手動デプロイも可能です。

1. [Vercel](https://vercel.com)にログインします。

2. このプロジェクトのダッシュボードに移動し、「Deployments」タブから新しいデプロイを開始できます。

## 貢献方法

1. このリポジトリをフォークします
2. 新しいブランチを作成します (`git checkout -b feature/amazing-feature`)
3. 変更をコミットします (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュします (`git push origin feature/amazing-feature`)
5. プルリクエストを作成します

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細については `LICENSE` ファイルを参照してください。

## 謝辞

- [PokeAPI](https://pokeapi.co/) - ポケモンデータの提供
- [Remix](https://remix.run/) - Webアプリケーションフレームワーク
- [TailwindCSS](https://tailwindcss.com/) - スタイリング
- [Radix UI](https://www.radix-ui.com/) - アクセシビリティに優れたUIコンポーネント

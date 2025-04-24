import { useState, useEffect } from 'react';
import type { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix";
import { json, redirect, isRouteErrorResponse } from "@vercel/remix";
import { useLoaderData, useNavigation, Form, useActionData, useSubmit, useRouteError } from "@remix-run/react";
import { Volume2, HelpCircle, Award, AlertTriangle } from 'lucide-react';
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { quizCategories, achievements } from "~/data/pokemon-data";
import { getRandomCategory, getProgressiveHint } from "~/utils/quiz-helpers";
import type { PokemonData, QuizCategory, Achievement, Option } from "~/types";

export const meta: MetaFunction = () => {
  return [
    { title: "ポケモンクイズ" },
    { description: "ポケモンについて学びながら、日本語も覚えよう！" },
  ];
};

/**
 * セッションから状態を読み込むローダー関数
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 新しいクイズを開始する場合、PokeAPIからランダムなポケモンデータを取得
  try {
    const response = await fetch(new URL('/api/pokemon', request.url).toString());
    if (!response.ok) {
      throw new Error(`ポケモンデータの取得に失敗しました: ${response.statusText}`);
    }
    
    const pokemonData = await response.json();
    
    // ランダムなカテゴリを選択
    const category = getRandomCategory(quizCategories);
    const property = pokemonData[category.en];
    
    if (!property) {
      throw new Error(`選択されたカテゴリ "${category.en}" のデータがありません`);
    }
    
    // オプションを取得
    const optionsResponse = await fetch(
      new URL(`/api/options?category=${category.en}&correctAnswerEn=${property.en}&correctAnswerJp=${property.jp}`, request.url).toString()
    );
    
    if (!optionsResponse.ok) {
      throw new Error(`オプションの取得に失敗しました: ${optionsResponse.statusText}`);
    }
    
    const { options } = await optionsResponse.json();
    
    return json({
      pokemonData,
      category,
      options,
      correctStreak: 0,
      incorrectStreak: 0,
      pokemonMasterLevel: 'Beginner',
      error: null
    });
  } catch (error) {
    console.error("クイズの読み込みエラー:", error);
    
    // エラーをスローしてErrorBoundaryで処理
    throw new Response("クイズの読み込みに失敗しました。もう一度お試しください。", { 
      status: 500 
    });
  }
};

/**
 * クイズの回答を処理するアクション関数
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const answer = formData.get("answer") as string;
  const correctAnswer = formData.get("correctAnswer") as string;
  const correctStreak = parseInt(formData.get("correctStreak") as string, 10) || 0;
  const incorrectStreak = parseInt(formData.get("incorrectStreak") as string, 10) || 0;
  const pokemonId = formData.get("pokemonId") as string;
  const pokemonNameEn = formData.get("pokemonNameEn") as string;
  const pokemonNameJp = formData.get("pokemonNameJp") as string;
  const categoryEn = formData.get("categoryEn") as string;
  const categoryJp = formData.get("categoryJp") as string;
  const actionType = formData.get("actionType") as string;
  
  // 「スキップ」ボタンが押された場合は新しいクイズにリダイレクト
  if (actionType === "skip") {
    return redirect("/quiz");
  }
  
  const isCorrect = answer === correctAnswer;
  
  let newCorrectStreak = correctStreak;
  let newIncorrectStreak = incorrectStreak;
  let achievement = null;
  
  if (isCorrect) {
    newCorrectStreak = correctStreak + 1;
    newIncorrectStreak = 0;
    
    // 達成チェック
    const achievementItem = achievements.find(a => a.streak === newCorrectStreak);
    if (achievementItem) {
      achievement = achievementItem;
    }
  } else {
    newCorrectStreak = 0;
    newIncorrectStreak = incorrectStreak + 1;
  }
  
  return json({
    isCorrect,
    correctStreak: newCorrectStreak,
    incorrectStreak: newIncorrectStreak,
    achievement,
    answer,
    correctAnswer,
    pokemonNameEn,
    pokemonNameJp,
    categoryEn,
    categoryJp
  });
};

/**
 * エラー境界処理コンポーネント
 */
export function ErrorBoundary() {
  const error = useRouteError();
  let heading = "エラーが発生しました";
  let message = "予期しないエラーが発生しました。もう一度お試しください。";

  if (isRouteErrorResponse(error)) {
    heading = `${error.status} ${error.statusText}`;
    message = error.data;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">ポケモンクイズ</h1>
      <div className="max-w-md mx-auto bg-red-100 p-6 rounded-lg border-l-4 border-red-500">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          <h2 className="text-xl font-bold text-red-700">{heading}</h2>
        </div>
        <p className="text-red-700 mb-4">{message}</p>
        <Button onClick={() => window.location.href = '/quiz'} className="w-full">
          もう一度試す
        </Button>
      </div>
    </div>
  );
};

export default function Quiz() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  
  // ローカルステート
  const [showJapanese, setShowJapanese] = useState(false);
  const [isShowJapaneseDisabled, setIsShowJapaneseDisabled] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [pokemonMasterLevel, setPokemonMasterLevel] = useState('Beginner');
  const [correctStreak, setCorrectStreak] = useState(0);
  
  // ローダーデータが変更されたらローカルステートをリセット
  useEffect(() => {
    if (loaderData && !loaderData.error) {
      setDisabledOptions([]);
      setShowJapanese(false);
      setShowHint(false);
      setHintLevel(0);
      setCorrectStreak(loaderData.correctStreak || 0);
      setPokemonMasterLevel(loaderData.pokemonMasterLevel || 'Beginner');
    }
  }, [loaderData]);
  
  // アクションの結果を処理
  useEffect(() => {
    if (actionData) {
      if (actionData.isCorrect) {
        setCorrectStreak(actionData.correctStreak);
        
        // 達成がある場合
        if (actionData.achievement) {
          setCurrentAchievement(actionData.achievement);
          setShowAchievement(true);
          setPokemonMasterLevel(actionData.achievement.title);
        } else {
          // 達成がない場合はモーダルを表示
          setShowModal(true);
        }
      } else {
        // 不正解の場合
        setDisabledOptions(prev => [...prev, actionData.answer]);
        setHintLevel(prevLevel => Math.min(prevLevel + 1, 3));
        setShowModal(true);
      }
    }
  }, [actionData]);
  
  // 日本語の表示・非表示を切り替える
  const handleShowJapaneseClick = () => {
    setShowJapanese(true);
    setIsShowJapaneseDisabled(true);
    setTimeout(() => {
      setShowJapanese(false);
      setIsShowJapaneseDisabled(false);
    }, 3000);
  };
  
  // モーダルを閉じる
  const handleModalClose = () => {
    setShowModal(false);
    
    // 正解だった場合は新しいクイズにリダイレクト
    if (actionData?.isCorrect) {
      submit(
        { actionType: "skip" },
        { method: "post", action: "/quiz" }
      );
    }
  };
  
  // 達成モーダルを閉じる
  const handleAchievementClose = () => {
    setShowAchievement(false);
    submit(
      { actionType: "skip" },
      { method: "post", action: "/quiz" }
    );
  };
  
  // テキストを読み上げる
  const speakText = (textEn: string, textJp: string) => {
    const utteranceEn = new SpeechSynthesisUtterance(textEn);
    utteranceEn.lang = 'en-GB';
    const englishVoices = speechSynthesis.getVoices().filter(voice => voice.lang === 'en-GB');
    utteranceEn.voice = englishVoices.find(voice => voice.name === 'Google UK English Female') || englishVoices[0] || null;
    
    const utteranceJp = new SpeechSynthesisUtterance(textJp);
    utteranceJp.lang = 'ja-JP';
    const japaneseVoices = speechSynthesis.getVoices().filter(voice => voice.lang === 'ja-JP');
    utteranceJp.voice = japaneseVoices.find(voice => voice.name === 'O-Ren') || japaneseVoices[0] || null;

    utteranceEn.onend = () => {
      setTimeout(() => {
        window.speechSynthesis.speak(utteranceJp);
      }, 500);
    };

    window.speechSynthesis.speak(utteranceEn);
  };
  
  // フィードバックメッセージを取得
  const getCorrectFeedback = () => {
    const feedbacks = [
      "せいかい！よくできたね！",
      "すごい！あってるよ！",
      "ばっちり！そのちょうし！",
      "かんぺき！すごいね！",
      "すごい！きみはポケモンマスターだ！"
    ];
    return feedbacks[Math.min(correctStreak, feedbacks.length - 1)];
  };
  
  const getIncorrectFeedback = () => {
    const feedbacks = [
      "ちょっとちがうよ！でもだいじょうぶ！",
      "おしいね！もういっかいやってみよう！",
      "がんばって！つぎはできるよ！",
      "ちがうけど、よくがんばったね！",
      "もうすこしだよ！つぎはせいかいできるよ！"
    ];
    const encouragements = [
      "がんばって！",
      "じぶんをしんじて！",
      "ポジティブにいこう！",
      "そのちょうし！",
      "すこしずつすすんでるよ！"
    ];
    const feedback = feedbacks[Math.min(actionData?.incorrectStreak || 0, feedbacks.length - 1)];
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    return `${feedback} ${encouragement}`;
  };

  // ローディング中または初期化エラー
  if (navigation.state === "loading" || !loaderData) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  // エラーメッセージの表示
  if (loaderData.error) {
    return (
      <div className="max-w-md mx-auto bg-red-100 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">エラーが発生しました</h2>
        <p className="text-red-700">{loaderData.error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          もう一度試す
        </Button>
      </div>
    );
  }
  
  const { pokemonData, category, options } = loaderData;
  const correctAnswer = pokemonData[category.en].en;
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">ポケモンクイズ</h1>
      
      <div className="max-w-md mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <span>Streak: {correctStreak}</span>
          <span>Level: {pokemonMasterLevel}</span>
        </div>
        
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{pokemonData.name.en} {`(${pokemonData.name.jp})`}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speakText(pokemonData.name.en, pokemonData.name.jp)}
                type="button"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 flex justify-between items-center">
              <span>{pokemonData.descriptionJp}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speakText('', pokemonData.descriptionJp)}
                type="button"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </p>
          </CardContent>
          <CardContent>
            <img
              src={pokemonData.image}
              alt={pokemonData.name.en}
              className="w-full h-48 object-contain mb-4"
            />
            <p className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 flex justify-between items-center">
              <span className="font-bold text-lg">
                What is this Pokémon's <strong>{category.en}</strong>?
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speakText(
                  `What is this Pokémon's ${category.en}?`,
                  `このポケモンの${category.jp}は、なんですか？`
                )}
                type="button"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </p>
            
            <Form method="post" className="grid grid-cols-2 gap-2">
              <input type="hidden" name="correctAnswer" value={correctAnswer} />
              <input type="hidden" name="correctStreak" value={correctStreak} />
              <input type="hidden" name="incorrectStreak" value={actionData?.incorrectStreak || 0} />
              <input type="hidden" name="pokemonId" value={pokemonData.id} />
              <input type="hidden" name="pokemonNameEn" value={pokemonData.name.en} />
              <input type="hidden" name="pokemonNameJp" value={pokemonData.name.jp} />
              <input type="hidden" name="categoryEn" value={category.en} />
              <input type="hidden" name="categoryJp" value={category.jp} />
              
              {options.map((option, index) => (
                <Button
                  key={index}
                  type="submit"
                  name="answer"
                  value={option.en}
                  onClick={() => speakText(option.en, '')}
                  variant={disabledOptions.includes(option.en) ? 'destructive' : 'outline'}
                  disabled={disabledOptions.includes(option.en)}
                  className="relative"
                >
                  {option.en}
                  <small className="block">
                    {showJapanese
                      ? `(${option.jp})`
                      : showHint
                        ? getProgressiveHint(option.jp, hintLevel)
                        : ''
                    }
                  </small>
                </Button>
              ))}
            </Form>
          </CardContent>
        </Card>
        
        <div className="flex justify-between mb-4">
          <Form method="post">
            <input type="hidden" name="actionType" value="skip" />
            <Button type="submit" className="flex-grow mr-2">
              Skip
            </Button>
          </Form>
          
          <Button
            variant="outline"
            onClick={handleShowJapaneseClick}
            className="flex-grow"
            disabled={isShowJapaneseDisabled}
            type="button"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            {showJapanese ? 'かくす' : 'にほんご'}
          </Button>
        </div>
      </div>
      
      {/* 回答結果モーダル */}
      <Dialog open={showModal} onOpenChange={handleModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionData?.isCorrect ? 'せいかい!' : 'ざんねん！もういちど！'}
            </DialogTitle>
            <DialogDescription>
              {actionData?.isCorrect
                ? `Great job! ${actionData.pokemonNameJp}の${actionData.categoryJp}は、 ${actionData.correctAnswer}！`
                : getIncorrectFeedback()
              }
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleModalClose}>
            {actionData?.isCorrect ? 'つぎのクイズ' : 'もういちど'}
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* 達成モーダル */}
      <Dialog open={showAchievement} onOpenChange={handleAchievementClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Award className="mr-2 h-6 w-6 text-yellow-400" />
              Achievement Unlocked!
            </DialogTitle>
            <DialogDescription>
              <p className="text-lg font-bold">{currentAchievement?.title}</p>
              <p>{currentAchievement?.message}</p>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleAchievementClose}>Continue</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

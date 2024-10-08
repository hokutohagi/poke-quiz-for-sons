import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Volume2, HelpCircle, Lightbulb, Award } from 'lucide-react';
import { quizCategories, achievements } from '~/data/pokemon-data';
import { PokemonData, QuizCategory, Achievement, Option } from '~/types';
import { getRandomCategory, generateOptions, getProgressiveHint } from '~/utils/quiz-helpers';
import { getRandomPokemonData } from '~/utils/pokemon-api';


export const PokemonQuiz: React.FC = () => {
  const [currentPokemon, setCurrentPokemon] = useState<PokemonData | null>(null);
  const [currentCategory, setCurrentCategory] = useState<QuizCategory>({"en": "color", "jp": "いろ"});
  const [options, setOptions] = useState<Option[]>([]);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isShowJapaneseDisabled, setIsShowJapaneseDisabled] = useState(false);
  const [showJapanese, setShowJapanese] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '' });
  const [correctStreak, setCorrectStreak] = useState(0);
  const [incorrectStreak, setIncorrectStreak] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [pokemonMasterLevel, setPokemonMasterLevel] = useState('Beginner');

  const startNewQuiz = useCallback(async () => {
    try {
      const pokemon = await getRandomPokemonData();
      if (!pokemon) {
        throw new Error('Failed to fetch Pokemon data');
      }
      const category = getRandomCategory(quizCategories);
      const correctAnswer = pokemon[category.en as keyof PokemonData] as string;
      const options = await generateOptions(category, pokemon);
      setCurrentPokemon(pokemon);
      setCurrentCategory(category);
      setDisabledOptions([]);
      setIsCorrect(null);
      setShowJapanese(false);
      setShowHint(false);
      setHintLevel(0);
      setOptions(options);
    } catch (error) {
      console.error('Error starting new quiz:', error);
    }
  }, []);

  useEffect(() => {
    startNewQuiz();
  }, [startNewQuiz]);


  const handleShowJapaneseClick = () => {
    setShowJapanese(true);
    setIsShowJapaneseDisabled(true);
    setTimeout(() => {
      setShowJapanese(false);
      setIsShowJapaneseDisabled(false);
    }, 3000);
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (isCorrect) {
      startNewQuiz();
    }
  };

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
    const feedback = feedbacks[Math.min(incorrectStreak, feedbacks.length - 1)];
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    return `${feedback} ${encouragement}`;
  };

  const speakFeedback = (isCorrect: boolean) => {
    const message = isCorrect ? getCorrectFeedback() : getIncorrectFeedback();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'ja-JP';
    const japaneseVoices = speechSynthesis.getVoices().filter(voice => voice.lang === 'ja-JP');
    utterance.voice = japaneseVoices.find(voice => voice.name === 'O-Ren') || japaneseVoices[0] || null;
    window.speechSynthesis.speak(utterance);
  };

  const checkAchievement = (streak: number) => {
    const achievement = achievements.find(a => a.streak === streak);
    if (achievement) {
      setCurrentAchievement(achievement);
      setShowAchievement(true);
      setPokemonMasterLevel(achievement.title);
    }
  };

  const handleAnswer = (answer: string) => {
    speakText(answer, '');

    if (!currentPokemon || !currentCategory) return;

    const currentProperty = currentPokemon[currentCategory.en as keyof PokemonData];
    if (typeof currentProperty !== 'object' || currentProperty === null) return;
    
    const correct = answer === currentProperty.en;
    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      setIsCorrect(true);
      setIncorrectStreak(0);
      checkAchievement(newStreak);
      setModalContent({
        title: 'せいかい!',
        description: `Great job! ${currentPokemon.name.jp}の${currentCategory.jp}は、 ${answer}！`
      });
    } else {
      setIncorrectStreak(prevStreak => prevStreak + 1);
      setCorrectStreak(0);
      setDisabledOptions(prevDisabled => [...prevDisabled, answer]);
      setHintLevel(prevLevel => Math.min(prevLevel + 1, 3));
      const feedback = getIncorrectFeedback();
      setModalContent({
        title: 'ざんねん！もういちど！',
        description: feedback
      });
    }
    speakFeedback(correct);
    setShowModal(true);
  };

  const handleAchievementClose = () => {
    setShowAchievement(false);
    startNewQuiz();
  };

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

  if (!currentPokemon) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <span>Streak: {correctStreak}</span>
        <span>Level: {pokemonMasterLevel}</span>
      </div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{currentPokemon.name.en} {`(${currentPokemon.name.jp})`}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speakText(currentPokemon.name.en, currentPokemon.name.jp)}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 flex justify-between items-center">
            <span>{currentPokemon.descriptionJp}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speakText('', currentPokemon.descriptionJp)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
          </p>
        </CardContent>
        <CardContent>
          <img
            src={currentPokemon.image}
            alt={currentPokemon.name.en}
            className="w-full h-48 object-contain mb-4"
          />
          <p className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 flex justify-between items-center">
            <span className="font-bold text-lg">
              What is this Pokémon's <strong>{currentCategory.en}</strong>?
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speakText(
                `What is this Pokémon's ${currentCategory.en}?`,
                `このポケモンの${currentCategory.jp}は、なんですか？`
              )}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option.en)}
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
                    : ''}
                </small>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between mb-4">
        <Button onClick={startNewQuiz} className="flex-grow mr-2">
          Skip
        </Button>
        {/* <Button
          variant="outline"
          onClick={() => setShowHint(!showHint)}
          className="flex-shrink-0 mr-2"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </Button> */}
        <Button
          variant="outline"
          onClick={handleShowJapaneseClick}
          className="flex-grow"
          disabled={isShowJapaneseDisabled}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          {showJapanese ? 'かくす' : 'にほんご'}
        </Button>
      </div>

      <Dialog open={showModal} onOpenChange={handleModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalContent.title}</DialogTitle>
            <DialogDescription>{modalContent.description}</DialogDescription>
          </DialogHeader>
          <Button onClick={handleModalClose}>
            {isCorrect ? 'つぎのクイズ' : 'もういちど'}
          </Button>
        </DialogContent>
      </Dialog>

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
};

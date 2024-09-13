import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Volume2, HelpCircle, Lightbulb, Award } from 'lucide-react';
import { pokemonData, quizCategories, japaneseTranslations, achievements } from '~/data/pokemon-data';
import { PokemonData, QuizCategory, Achievement } from '~/types';
import { getRandomPokemon, getRandomCategory, generateOptions, getProgressiveHint } from '~/utils/quiz-helpers';

export const PokemonQuiz: React.FC = () => {
  const [currentPokemon, setCurrentPokemon] = useState<PokemonData | null>(null);
  const [currentCategory, setCurrentCategory] = useState<QuizCategory | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
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

  const startNewQuiz = () => {
    const pokemon = getRandomPokemon(pokemonData);
    const category = getRandomCategory(quizCategories);
    setCurrentPokemon(pokemon);
    setCurrentCategory(category);
    setOptions(generateOptions(pokemon[category.en as keyof PokemonData] as string, category, pokemonData));
    setDisabledOptions([]);
    setIsCorrect(null);
    setShowJapanese(false);
    setShowHint(false);
    setHintLevel(0);
  };

  const getCorrectFeedback = () => {
    const feedbacks = [
      "Correct! Well done!",
      "Great job! You're right!",
      "Excellent! Keep it up!",
      "Perfect! You're on fire!",
      "Amazing! You're a Pokémon master!"
    ];
    return feedbacks[Math.min(correctStreak, feedbacks.length - 1)];
  };

  const getIncorrectFeedback = () => {
    const feedbacks = [
      "Not quite, but don't worry! Every attempt helps you learn.",
      "Close! Remember, making mistakes is part of learning.",
      "Keep trying! You're getting better with each guess.",
      "That's not it, but your effort is awesome! Keep going!",
      "You're putting in great effort! The right answer is just around the corner."
    ];
    const encouragements = [
      "You can do it!",
      "Believe in yourself!",
      "Stay positive!",
      "Keep up the good work!",
      "You're making progress!"
    ];
    const feedback = feedbacks[Math.min(incorrectStreak, feedbacks.length - 1)];
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    return `${feedback} ${encouragement}`;
  };

  const speakFeedback = (isCorrect: boolean) => {
    const message = isCorrect ? getCorrectFeedback() : getIncorrectFeedback();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
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
    if (!currentPokemon || !currentCategory) return;
    
    const correct = answer === currentPokemon[currentCategory.en as keyof PokemonData];
    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      setIsCorrect(true);
      setIncorrectStreak(0);
      checkAchievement(newStreak);
      setModalContent({
        title: 'Correct!',
        description: `Great job! ${currentPokemon.nameEn}'s ${currentCategory.en} is indeed ${answer}.`
      });
    } else {
      setIncorrectStreak(prevStreak => prevStreak + 1);
      setCorrectStreak(0);
      setDisabledOptions(prevDisabled => [...prevDisabled, answer]);
      setHintLevel(prevLevel => Math.min(prevLevel + 1, 3));
      const feedback = getIncorrectFeedback();
      setModalContent({
        title: 'Not quite',
        description: feedback
      });
    }
    speakFeedback(correct);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (isCorrect) {
      startNewQuiz();
    }
  };

  const handleAchievementClose = () => {
    setShowAchievement(false);
    startNewQuiz();
  };

  const speakText = (textEn: string, textJp: string) => {
    const utteranceEn = new SpeechSynthesisUtterance(textEn);
    utteranceEn.lang = 'en-US';
    const utteranceJp = new SpeechSynthesisUtterance(textJp);
    utteranceJp.lang = 'ja-JP';

    utteranceEn.onend = () => {
      setTimeout(() => {
        window.speechSynthesis.speak(utteranceJp);
      }, 500);
    };

    window.speechSynthesis.speak(utteranceEn);
  };

  useEffect(() => {
    startNewQuiz();
  }, []);

  if (!currentPokemon || !currentCategory) return null;

  const handleShowJapaneseClick = () => {
    setShowJapanese(true);
    setTimeout(() => {
      setShowJapanese(false);
    }, 3000);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <span>Streak: {correctStreak}</span>
        <span>Level: {pokemonMasterLevel}</span>
      </div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{currentPokemon.nameEn} {showJapanese && `(${currentPokemon.nameJp})`}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speakText(currentPokemon.nameEn, currentPokemon.nameJp)}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <img
            src={currentPokemon.image}
            alt={currentPokemon.nameEn}
            className="w-full h-48 object-contain mb-4"
          />
          <p className="mb-2 flex justify-between items-center">
            <span>
              What is this Pokémon's <strong>{currentCategory.en}</strong>?
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speakText(
                `What is this Pokémon's ${currentCategory.en}?`,
                `このポケモンの${currentCategory.jp}はなんですか？`
              )}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option)}
                variant={disabledOptions.includes(option) ? 'destructive' : 'outline'}
                disabled={disabledOptions.includes(option)}
                className="relative"
              >
                {option}
                <small className="block">
                  {showJapanese
                  ? japaneseTranslations[option as keyof typeof japaneseTranslations]
                  : showHint
                  ? getProgressiveHint(japaneseTranslations[option as keyof typeof japaneseTranslations], hintLevel)
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
        <Button
          variant="outline"
          onClick={() => setShowHint(!showHint)}
          className="flex-shrink-0 mr-2"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </Button>
        <Button
          variant="outline"
          onClick={handleShowJapaneseClick}
          className="flex-shrink-0"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          {showJapanese ? 'Hide Japanese' : 'Show Japanese'}
        </Button>
      </div>

      <Dialog open={showModal} onOpenChange={handleModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalContent.title}</DialogTitle>
            <DialogDescription>{modalContent.description}</DialogDescription>
          </DialogHeader>
          <Button onClick={handleModalClose}>
            {isCorrect ? 'Next Question' : 'Try Again'}
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

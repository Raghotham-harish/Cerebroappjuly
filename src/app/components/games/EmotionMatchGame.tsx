import { useState, useEffect } from "react";
import { Trophy, RotateCcw, X, Smile } from "lucide-react";

interface EmotionMatchGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface EmotionCard {
  emoji: string;
  emotion: string;
  color: string;
}

const EMOTIONS: EmotionCard[] = [
  { emoji: "😊", emotion: "Happy", color: "#10B981" },
  { emoji: "😢", emotion: "Sad", color: "#3B82F6" },
  { emoji: "😠", emotion: "Angry", color: "#EF4444" },
  { emoji: "😨", emotion: "Scared", color: "#8B5CF6" },
  { emoji: "🤔", emotion: "Thoughtful", color: "#F59E0B" },
  { emoji: "😴", emotion: "Tired", color: "#6B7280" },
  { emoji: "😮", emotion: "Surprised", color: "#EC4899" },
  { emoji: "😌", emotion: "Calm", color: "#14B8A6" }
];

type GamePhase = "memorize" | "match" | "feedback";

interface Round {
  targetEmotion: EmotionCard;
  options: EmotionCard[];
  allEmotions: EmotionCard[];
}

export function EmotionMatchGame({ onClose, onComplete }: EmotionMatchGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [phase, setPhase] = useState<GamePhase>("memorize");
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [score, setScore] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [memorizeTime, setMemorizeTime] = useState(4);

  const TOTAL_ROUNDS = 6;
  const BASE_EMOTIONS_COUNT = 4;

  useEffect(() => {
    if (gameState === "playing" && !currentRound) {
      generateNewRound();
    }
  }, [currentRound, gameState]);

  useEffect(() => {
    if (phase === "memorize") {
      const timer = setTimeout(() => {
        setPhase("match");
      }, memorizeTime * 1000);

      return () => clearTimeout(timer);
    }
  }, [phase, memorizeTime]);

  const generateNewRound = () => {
    const emotionsCount = Math.min(BASE_EMOTIONS_COUNT + Math.floor(roundsCompleted / 2), 6);

    const shuffled = [...EMOTIONS].sort(() => Math.random() - 0.5);
    const roundEmotions = shuffled.slice(0, emotionsCount);

    const target = roundEmotions[Math.floor(Math.random() * roundEmotions.length)];

    const otherEmotions = EMOTIONS.filter(e => e.emotion !== target.emotion)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [target, ...otherEmotions].sort(() => Math.random() - 0.5);

    setCurrentRound({
      targetEmotion: target,
      options,
      allEmotions: roundEmotions
    });

    setMemorizeTime(3 + emotionsCount * 0.5);
  };

  const handleAnswer = (selectedEmotion: EmotionCard) => {
    const correct = selectedEmotion.emotion === currentRound?.targetEmotion.emotion;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
    }

    setPhase("feedback");

    setTimeout(() => {
      const newRounds = roundsCompleted + 1;
      setRoundsCompleted(newRounds);

      if (newRounds >= TOTAL_ROUNDS) {
        setGameState("finished");
      } else {
        setPhase("memorize");
        setCurrentRound(null);
        setIsCorrect(null);
      }
    }, 1500);
  };

  const handleRestart = () => {
    setScore(0);
    setRoundsCompleted(0);
    setCurrentRound(null);
    setIsCorrect(null);
    setPhase("memorize");
    setGameState("playing");
  };

  const accuracy = TOTAL_ROUNDS > 0 ? Math.round((score / TOTAL_ROUNDS) * 100) : 0;

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Emotion Match</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>{score}/{TOTAL_ROUNDS}</h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Emotions matched</p>

          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Emotional recognition</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{accuracy}%</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 500 }}>
              {accuracy === 100 ? "Perfect emotional awareness!" :
               accuracy >= 80 ? "Excellent emotion recognition!" :
               accuracy >= 60 ? "Good emotional intelligence! Keep practicing." :
               "Your emotional awareness will grow!"}
            </p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button onClick={handleRestart} className="w-full py-3 rounded-full flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
            <button onClick={onClose} className="w-full py-3 rounded-full" style={{ background: 'white', border: '2px solid #E5E7EB', color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Back to Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRound) return null;

  if (phase === "memorize") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <div className="flex items-center gap-2">
            <Smile className="w-4 h-4" style={{ color: '#8B5CF6' }} />
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>Memorizing...</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>
            Remember these emotions
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm w-full mb-6">
            {currentRound.allEmotions.map((emotion, index) => (
              <div
                key={index}
                className="p-6 rounded-3xl flex flex-col items-center animate-pulse"
                style={{ background: 'rgba(255,255,255,0.9)', border: '3px solid #8B5CF6' }}
              >
                <span className="text-6xl mb-2">{emotion.emoji}</span>
                <span
                  className="text-sm px-3 py-1 rounded-full"
                  style={{
                    background: emotion.color,
                    color: 'white',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600
                  }}
                >
                  {emotion.emotion}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Match the face to the emotion...
          </p>
        </div>
      </div>
    );
  }

  if (phase === "match") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Round {roundsCompleted + 1}/{TOTAL_ROUNDS}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="mb-8 p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.9)', border: '3px solid #8B5CF6' }}>
            <span className="text-8xl">{currentRound.targetEmotion.emoji}</span>
          </div>

          <p className="text-base mb-6" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
            Which emotion is this?
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
            {currentRound.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="p-4 rounded-2xl transition-all active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '2px solid #E5E7EB'
                }}
              >
                <span
                  className="text-sm px-3 py-2 rounded-full block"
                  style={{
                    background: option.color,
                    color: 'white',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600
                  }}
                >
                  {option.emotion}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "feedback") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
            style={{ background: isCorrect ? 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' : 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)' }}
          >
            <span className="text-6xl">{isCorrect ? "✓" : "✗"}</span>
          </div>

          <h2 className="text-3xl mb-4" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
            {isCorrect ? "Perfect match!" : "Not quite"}
          </h2>

          {!isCorrect && (
            <div className="flex flex-col items-center">
              <p className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>The correct emotion was:</p>
              <span
                className="text-base px-4 py-2 rounded-full"
                style={{
                  background: currentRound.targetEmotion.color,
                  color: 'white',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600
                }}
              >
                {currentRound.targetEmotion.emotion}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

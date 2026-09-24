import { useState, useEffect } from "react";
import { Trophy, RotateCcw, X, Eye, EyeOff } from "lucide-react";

interface ObjectTrayGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const ALL_OBJECTS = [
  { emoji: "📱", name: "Phone" },
  { emoji: "✏️", name: "Pencil" },
  { emoji: "📚", name: "Book" },
  { emoji: "⌚", name: "Watch" },
  { emoji: "🔑", name: "Keys" },
  { emoji: "💼", name: "Briefcase" },
  { emoji: "☕", name: "Coffee" },
  { emoji: "🎧", name: "Headphones" },
  { emoji: "📷", name: "Camera" },
  { emoji: "🎒", name: "Backpack" },
  { emoji: "👓", name: "Glasses" },
  { emoji: "💳", name: "Card" },
  { emoji: "🖊️", name: "Pen" },
  { emoji: "📝", name: "Notebook" },
  { emoji: "🔦", name: "Flashlight" }
];

type GamePhase = "memorize" | "question" | "feedback";

interface Round {
  objects: typeof ALL_OBJECTS[0][];
  missingObject: typeof ALL_OBJECTS[0];
  options: typeof ALL_OBJECTS[0][];
}

export function ObjectTrayGame({ onClose, onComplete }: ObjectTrayGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [phase, setPhase] = useState<GamePhase>("memorize");
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [score, setScore] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [memorizeTime, setMemorizeTime] = useState(10);

  const TOTAL_ROUNDS = 5;
  const BASE_OBJECTS_COUNT = 6;

  useEffect(() => {
    if (gameState === "playing" && !currentRound) {
      generateNewRound();
    }
  }, [currentRound, gameState]);

  useEffect(() => {
    if (phase === "memorize") {
      const timer = setTimeout(() => {
        setPhase("question");
      }, memorizeTime * 1000);

      return () => clearTimeout(timer);
    }
  }, [phase, memorizeTime]);

  const generateNewRound = () => {
    // Increase difficulty: more objects as rounds progress
    const objectsCount = BASE_OBJECTS_COUNT + Math.floor(roundsCompleted / 2);
    const count = Math.min(objectsCount, ALL_OBJECTS.length - 4);

    // Pick random objects for the tray
    const shuffled = [...ALL_OBJECTS].sort(() => Math.random() - 0.5);
    const trayObjects = shuffled.slice(0, count);

    // Pick one that was shown as the missing object
    const missingIndex = Math.floor(Math.random() * trayObjects.length);
    const missing = trayObjects[missingIndex];

    // Generate 4 options: 3 from tray + 1 NOT from tray
    const notOnTray = shuffled.slice(count);
    const wrongOption = notOnTray[Math.floor(Math.random() * notOnTray.length)];

    const otherTrayObjects = trayObjects.filter((_, i) => i !== missingIndex).sort(() => Math.random() - 0.5).slice(0, 2);
    const options = [wrongOption, ...otherTrayObjects, missing].sort(() => Math.random() - 0.5);

    setCurrentRound({
      objects: trayObjects,
      missingObject: wrongOption,
      options
    });

    setMemorizeTime(5 + count * 0.5); // More time for more objects
  };

  const handleAnswer = (answer: typeof ALL_OBJECTS[0]) => {
    const correct = answer.emoji === currentRound?.missingObject.emoji;
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
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Object Tray</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>{score}/{TOTAL_ROUNDS}</h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Objects remembered</p>

          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Visual memory</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{accuracy}%</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 500 }}>
              {accuracy === 100 ? "Perfect visual memory! Outstanding!" :
               accuracy >= 80 ? "Excellent observation skills!" :
               accuracy >= 60 ? "Good memory! Keep practicing." :
               "Your visual memory will improve."}
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
            <Eye className="w-4 h-4" style={{ color: '#8B5CF6' }} />
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>Memorizing...</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>
            Memorize these objects
          </p>

          <div className="p-6 rounded-3xl mb-6 max-w-md" style={{ background: 'rgba(255,255,255,0.9)', border: '3px solid #8B5CF6' }}>
            <div className="grid grid-cols-3 gap-4">
              {currentRound.objects.map((obj, index) => (
                <div key={index} className="flex flex-col items-center animate-pulse">
                  <span className="text-5xl mb-1">{obj.emoji}</span>
                  <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>{obj.name}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Remember all the objects...
          </p>
        </div>
      </div>
    );
  }

  if (phase === "question") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4" style={{ color: '#8B5CF6' }} />
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Round {roundsCompleted + 1}/{TOTAL_ROUNDS}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="p-6 rounded-3xl mb-8" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #8B5CF6' }}>
            <p className="text-lg text-center" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
              Which object was NOT on the tray?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm w-full">
            {currentRound.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="p-6 rounded-2xl flex flex-col items-center transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}
              >
                <span className="text-6xl mb-2">{option.emoji}</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>{option.name}</span>
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
            {isCorrect ? "Correct!" : "Not quite"}
          </h2>

          {!isCorrect && (
            <div className="flex flex-col items-center">
              <p className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>The missing object was:</p>
              <span className="text-6xl">{currentRound.missingObject.emoji}</span>
              <p className="text-base" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>{currentRound.missingObject.name}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

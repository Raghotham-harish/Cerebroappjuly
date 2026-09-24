import { useState, useEffect, useRef } from "react";
import { Trophy, RotateCcw, X } from "lucide-react";

interface ColorTapGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface ColorOption {
  name: string;
  hex: string;
}

const COLORS: ColorOption[] = [
  { name: "RED", hex: "#EF4444" },
  { name: "BLUE", hex: "#3B82F6" },
  { name: "GREEN", hex: "#10B981" },
  { name: "YELLOW", hex: "#F59E0B" },
  { name: "PURPLE", hex: "#8B5CF6" }
];

export function ColorTapGame({ onClose, onComplete }: ColorTapGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 second game
  const [targetColor, setTargetColor] = useState<ColorOption>(COLORS[0]);
  const [wordColor, setWordColor] = useState<ColorOption>(COLORS[1]); // Stroop effect
  const [shuffledColors, setShuffledColors] = useState<ColorOption[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game
  useEffect(() => {
    startNewRound();
    startTimer();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startNewRound = () => {
    // Pick random target color
    const newTarget = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(newTarget);

    // Pick different color for word (Stroop effect)
    const differentColors = COLORS.filter(c => c.name !== newTarget.name);
    const newWordColor = differentColors[Math.floor(Math.random() * differentColors.length)];
    setWordColor(newWordColor);

    // Shuffle all colors for buttons
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    setShuffledColors(shuffled);
  };

  const handleColorTap = (tappedColor: ColorOption) => {
    if (tappedColor.name === targetColor.name) {
      // Correct!
      setScore(prev => prev + 1);
      startNewRound();
    } else {
      // Wrong!
      setErrors(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setErrors(0);
    setTimeLeft(30);
    setGameState("playing");
    startNewRound();
    startTimer();
  };

  const accuracy = score + errors > 0 ? Math.round((score / (score + errors)) * 100) : 0;

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
            Color Tap
          </h2>
          <div className="w-10" />
        </div>

        {/* Results */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
            {score}
          </h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Correct taps
          </p>

          {/* Stats */}
          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Accuracy</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{accuracy}%</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Correct</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>{score}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Errors</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#EF4444', fontWeight: 600 }}>{errors}</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 500 }}>
              {accuracy >= 90 ? "Excellent focus! Your attention is sharp." :
               accuracy >= 75 ? "Great work! Keep building that selective attention." :
               accuracy >= 60 ? "Good effort! Practice makes perfect." :
               "Keep practicing! Your focus will improve."}
            </p>
          </div>

          {/* Buttons */}
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
          <X className="w-5 h-5" style={{ color: '#6B7280' }} />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Score:</span>
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Time:</span>
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: timeLeft <= 10 ? '#EF4444' : '#8B5CF6', fontWeight: 600 }}>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Instructions */}
        <div className="mb-8 text-center">
          <p className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Tap the color:
          </p>
          <h1 className="text-5xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 700, color: wordColor.hex }}>
            {targetColor.name}
          </h1>
          <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}>
            Focus on the word, not the color!
          </p>
        </div>

        {/* Color Buttons */}
        <div className="grid grid-cols-3 gap-4 max-w-sm w-full">
          {shuffledColors.map((color, index) => (
            <button
              key={`${color.name}-${index}`}
              onClick={() => handleColorTap(color)}
              className="aspect-square rounded-full transition-all active:scale-90 flex items-center justify-center"
              style={{
                background: color.hex,
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                gridColumn: index === 2 ? '2' : 'auto' // Center 3rd button
              }}
            >
              <span className="text-white text-xs font-bold opacity-0">{color.name}</span>
            </button>
          ))}
        </div>

        {/* Score Feedback */}
        <div className="mt-8 flex gap-2">
          {[...Array(Math.min(score, 10))].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
          ))}
          {[...Array(Math.min(errors, 5))].map((_, i) => (
            <div key={`error-${i}`} className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

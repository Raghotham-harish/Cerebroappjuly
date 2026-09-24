import { useState, useEffect, useRef } from "react";
import { Trophy, RotateCcw, X, Zap } from "lucide-react";

interface MultiTaskRelayGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

type Color = "red" | "blue" | "green" | "yellow";

const COLORS: Color[] = ["red", "blue", "green", "yellow"];
const COLOR_MAP = {
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  yellow: "#FBBF24"
};

export function MultiTaskRelayGame({ onClose, onComplete }: MultiTaskRelayGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [timeRemaining, setTimeRemaining] = useState(45);

  const [topColor, setTopColor] = useState<Color>("red");
  const [topTargetColor, setTopTargetColor] = useState<Color>("red");
  const [topScore, setTopScore] = useState(0);

  const [bottomNumber, setBottomNumber] = useState(5);
  const [bottomScore, setBottomScore] = useState(0);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState === "playing") {
      gameTimerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState("finished");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      generateTopTask();
      generateBottomTask();

      return () => {
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      };
    }
  }, [gameState]);

  const generateTopTask = () => {
    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTopColor(newColor);
    setTopTargetColor(targetColor);
  };

  const generateBottomTask = () => {
    setBottomNumber(Math.floor(Math.random() * 20) + 1);
  };

  const handleTopMatch = () => {
    if (topColor === topTargetColor) {
      setTopScore(prev => prev + 1);
    }
    generateTopTask();
  };

  const handleTopSkip = () => {
    if (topColor !== topTargetColor) {
      setTopScore(prev => prev + 1);
    }
    generateTopTask();
  };

  const handleBottomEven = () => {
    if (bottomNumber % 2 === 0) {
      setBottomScore(prev => prev + 1);
    }
    generateBottomTask();
  };

  const handleBottomOdd = () => {
    if (bottomNumber % 2 === 1) {
      setBottomScore(prev => prev + 1);
    }
    generateBottomTask();
  };

  const handleRestart = () => {
    setTopScore(0);
    setBottomScore(0);
    setTimeRemaining(45);
    setGameState("playing");
  };

  const totalScore = topScore + bottomScore;
  const taskBalance = Math.abs(topScore - bottomScore);

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Multi-Task Relay</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>{totalScore}</h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Total tasks completed</p>

          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Color matching</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#3B82F6', fontWeight: 600 }}>{topScore}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Number sorting</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>{bottomScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Task balance</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 600 }}>±{taskBalance}</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 500 }}>
              {totalScore >= 40 ? "Amazing multitasking!" :
               totalScore >= 30 ? "Great task juggling!" :
               totalScore >= 20 ? "You're learning to switch!" :
               "Multitasking takes practice!"}
            </p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button onClick={handleRestart} className="w-full py-3 rounded-full flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
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
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
          <X className="w-5 h-5" style={{ color: '#6B7280' }} />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: '#F59E0B' }} />
          <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 600 }}>{timeRemaining}s</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4 border-b-2" style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: '#3B82F6' }}>
          <p className="text-xs mb-3" style={{ fontFamily: 'Inter, sans-serif', color: '#1E40AF', fontWeight: 600 }}>
            MATCH THIS COLOR: <span style={{ color: COLOR_MAP[topTargetColor] }}>●</span>
          </p>

          <div
            className="w-32 h-32 rounded-full mb-4"
            style={{ background: COLOR_MAP[topColor] }}
          />

          <div className="flex gap-2 w-full max-w-xs">
            <button
              onClick={handleTopMatch}
              className="flex-1 py-2 rounded-xl transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
            >
              MATCH
            </button>
            <button
              onClick={handleTopSkip}
              className="flex-1 py-2 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #3B82F6', color: '#3B82F6', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
            >
              SKIP
            </button>
          </div>

          <p className="text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif', color: '#3B82F6', fontWeight: 600 }}>
            Score: {topScore}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
          <p className="text-xs mb-3" style={{ fontFamily: 'Inter, sans-serif', color: '#065F46', fontWeight: 600 }}>
            IS IT EVEN OR ODD?
          </p>

          <div
            className="w-32 h-32 rounded-2xl mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' }}
          >
            <span className="text-6xl" style={{ fontFamily: 'Lora, serif', fontWeight: 700, color: 'white' }}>
              {bottomNumber}
            </span>
          </div>

          <div className="flex gap-2 w-full max-w-xs">
            <button
              onClick={handleBottomEven}
              className="flex-1 py-2 rounded-xl transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
            >
              EVEN
            </button>
            <button
              onClick={handleBottomOdd}
              className="flex-1 py-2 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #10B981', color: '#10B981', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
            >
              ODD
            </button>
          </div>

          <p className="text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>
            Score: {bottomScore}
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Trophy, RotateCcw, X, Waves } from "lucide-react";

interface StormBalanceGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

type GamePhase = "playing" | "finished";

export function StormBalanceGame({ onClose, onComplete }: StormBalanceGameProps) {
  const [gameState, setGameState] = useState<GamePhase>("playing");
  const [balance, setBalance] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [waveDirection, setWaveDirection] = useState<"left" | "right">("left");
  const [waveStrength, setWaveStrength] = useState(1);
  const [isBalancing, setIsBalancing] = useState(false);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const balanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_TILT = 45;

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

      generateWave();

      return () => {
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
        if (waveTimerRef.current) clearInterval(waveTimerRef.current);
        if (balanceTimerRef.current) clearInterval(balanceTimerRef.current);
      };
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === "playing") {
      const interval = setInterval(() => {
        setBalance(prev => {
          const newBalance = waveDirection === "left" ? prev - waveStrength : prev + waveStrength;

          if (Math.abs(newBalance) >= MAX_TILT) {
            setGameState("finished");
            return newBalance;
          }

          return newBalance;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [waveDirection, waveStrength, gameState]);

  useEffect(() => {
    if (Math.abs(balance) < 10 && gameState === "playing") {
      setScore(prev => prev + 1);
    }
  }, [balance, gameState]);

  const generateWave = () => {
    const nextWave = () => {
      const direction = Math.random() < 0.5 ? "left" : "right";
      const strength = 0.5 + Math.random() * 1.5 + (60 - timeRemaining) * 0.02;

      setWaveDirection(direction);
      setWaveStrength(Math.min(strength, 3));

      const nextInterval = 2000 + Math.random() * 2000;
      waveTimerRef.current = setTimeout(nextWave, nextInterval);
    };

    nextWave();
  };

  const handleBalanceLeft = () => {
    setIsBalancing(true);
    setBalance(prev => Math.max(prev - 5, -MAX_TILT));

    if (balanceTimerRef.current) clearTimeout(balanceTimerRef.current);
    balanceTimerRef.current = setTimeout(() => setIsBalancing(false), 100);
  };

  const handleBalanceRight = () => {
    setIsBalancing(true);
    setBalance(prev => Math.min(prev + 5, MAX_TILT));

    if (balanceTimerRef.current) clearTimeout(balanceTimerRef.current);
    balanceTimerRef.current = setTimeout(() => setIsBalancing(false), 100);
  };

  const handleRestart = () => {
    setBalance(0);
    setScore(0);
    setTimeRemaining(60);
    setWaveDirection("left");
    setWaveStrength(1);
    setGameState("playing");
  };

  const stayedBalanced = score > 0 ? Math.round((score / 600) * 100) : 0;

  if (gameState === "finished") {
    const capsized = Math.abs(balance) >= MAX_TILT;

    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Storm Balance</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
            {capsized ? "Capsized!" : "Time's Up!"}
          </h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            {capsized ? "You lost balance" : "You survived the storm!"}
          </p>

          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Balance maintained</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{stayedBalanced}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Time lasted</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>{60 - timeRemaining}s</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 500 }}>
              {stayedBalanced >= 80 ? "Outstanding emotional balance!" :
               stayedBalanced >= 60 ? "Great resilience in the storm!" :
               stayedBalanced >= 40 ? "Good effort! Keep building balance." :
               "Every storm teaches resilience!"}
            </p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button onClick={handleRestart} className="w-full py-3 rounded-full flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
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

  const getBoatTilt = () => {
    return balance;
  };

  const getWaterTilt = () => {
    return waveDirection === "left" ? -5 : 5;
  };

  const getTiltColor = () => {
    const absBalance = Math.abs(balance);
    if (absBalance < 15) return "#10B981";
    if (absBalance < 30) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
          <X className="w-5 h-5" style={{ color: '#6B7280' }} />
        </button>
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4" style={{ color: '#10B981' }} />
          <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>{timeRemaining}s</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 flex justify-between items-center">
          <div className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Balance: <span style={{ color: getTiltColor(), fontWeight: 600 }}>{Math.round(balance)}°</span>
          </div>
          <div className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>
            Wave: {waveDirection === "left" ? "←" : "→"} {Math.round(waveStrength * 10) / 10}x
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 transition-transform duration-500"
            style={{
              height: '40%',
              background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.3) 0%, rgba(29, 78, 216, 0.5) 100%)',
              transform: `rotate(${getWaterTilt()}deg)`,
              transformOrigin: 'center bottom'
            }}
          >
            <div className="w-full h-2" style={{ background: 'rgba(59, 130, 246, 0.5)' }} />
          </div>

          <div
            className="relative z-10 transition-transform duration-200"
            style={{
              transform: `rotate(${getBoatTilt()}deg)`,
              transformOrigin: 'center center'
            }}
          >
            <div
              className="text-8xl"
              style={{
                filter: Math.abs(balance) > 30 ? 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))' : 'none'
              }}
            >
              ⛵
            </div>
          </div>

          <div
            className="absolute top-1/2 left-0 right-0 h-px"
            style={{ background: 'rgba(16, 185, 129, 0.3)', transform: 'translateY(-50%)' }}
          />
        </div>

        <div className="p-4">
          <p className="text-center text-xs mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Tap to balance the boat. Don't let it tip over!
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleBalanceLeft}
              onTouchStart={handleBalanceLeft}
              className="flex-1 py-6 rounded-2xl transition-all active:scale-95"
              style={{
                background: isBalancing && balance < 0 ? 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' : 'rgba(255,255,255,0.9)',
                border: '2px solid #10B981',
                color: isBalancing && balance < 0 ? 'white' : '#10B981',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '18px'
              }}
            >
              ← Tilt Left
            </button>
            <button
              onClick={handleBalanceRight}
              onTouchStart={handleBalanceRight}
              className="flex-1 py-6 rounded-2xl transition-all active:scale-95"
              style={{
                background: isBalancing && balance > 0 ? 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' : 'rgba(255,255,255,0.9)',
                border: '2px solid #10B981',
                color: isBalancing && balance > 0 ? 'white' : '#10B981',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '18px'
              }}
            >
              Tilt Right →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

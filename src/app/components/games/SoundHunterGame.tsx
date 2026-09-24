import { useState, useEffect, useRef } from "react";
import { Trophy, RotateCcw, X, Volume2 } from "lucide-react";

interface SoundHunterGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface Sound {
  id: string;
  emoji: string;
  name: string;
  isTarget: boolean;
}

const BACKGROUND_SOUNDS = [
  { id: "car", emoji: "🚗", name: "Car horn" },
  { id: "vacuum", emoji: "🧹", name: "Vacuum" },
  { id: "dog", emoji: "🐕", name: "Dog bark" },
  { id: "phone", emoji: "📱", name: "Phone ring" },
  { id: "door", emoji: "🚪", name: "Door slam" },
  { id: "laugh", emoji: "😄", name: "Laughter" },
  { id: "kettle", emoji: "🫖", name: "Kettle whistle" }
];

const TARGET_SOUND = { id: "rain", emoji: "🌧️", name: "Rain drops" };

export function SoundHunterGame({ onClose, onComplete }: SoundHunterGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [currentSound, setCurrentSound] = useState<Sound | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const TOTAL_ROUNDS = 10;
  const SOUND_DISPLAY_TIME = 2000; // 2 seconds to see the sound
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState === "playing" && !currentSound) {
      playNextSound();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSound, gameState]);

  const playNextSound = () => {
    if (roundsPlayed >= TOTAL_ROUNDS) {
      setGameState("finished");
      return;
    }

    // Randomly decide if this round has target sound (40% chance)
    const isTargetRound = Math.random() < 0.4;

    let sound: Sound;
    if (isTargetRound) {
      sound = { ...TARGET_SOUND, isTarget: true };
    } else {
      const randomBg = BACKGROUND_SOUNDS[Math.floor(Math.random() * BACKGROUND_SOUNDS.length)];
      sound = { ...randomBg, isTarget: false };
    }

    setCurrentSound(sound);
    setIsListening(true);
    setFeedback(null);

    // Hide sound after display time
    timerRef.current = setTimeout(() => {
      setIsListening(false);
      setCurrentSound(null);
      setRoundsPlayed(prev => prev + 1);
    }, SOUND_DISPLAY_TIME);
  };

  const handleClick = () => {
    if (!isListening || !currentSound) return;

    if (currentSound.isTarget) {
      // Correct! They heard the target
      setScore(prev => prev + 1);
      setFeedback("correct");
    } else {
      // Incorrect! This wasn't the target
      setMisses(prev => prev + 1);
      setFeedback("incorrect");
    }

    // Clear timer and move to next sound
    if (timerRef.current) clearTimeout(timerRef.current);

    setTimeout(() => {
      setIsListening(false);
      setCurrentSound(null);
      setRoundsPlayed(prev => prev + 1);
    }, 500);
  };

  const handleRestart = () => {
    setScore(0);
    setMisses(0);
    setRoundsPlayed(0);
    setCurrentSound(null);
    setIsListening(false);
    setFeedback(null);
    setGameState("playing");
  };

  const accuracy = score + misses > 0 ? Math.round((score / (score + misses)) * 100) : 0;
  const targetSoundsTotal = BACKGROUND_SOUNDS.length + 1; // Approximate count of target sounds that appeared

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
            Sound Hunter
          </h2>
          <div className="w-10" />
        </div>

        {/* Results */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
            {score}
          </h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Target sounds caught
          </p>

          {/* Stats */}
          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Correct clicks</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>{score}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Incorrect clicks</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#EF4444', fontWeight: 600 }}>{misses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Accuracy</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{accuracy}%</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#3B82F6', fontWeight: 500 }}>
              {score >= 3 ? "Excellent auditory focus! Your concentration is sharp." :
               score >= 2 ? "Good listening! Keep practicing your auditory attention." :
               "Keep training! Your auditory focus will improve."}
            </p>
          </div>

          {/* Buttons */}
          <div className="w-full max-w-sm space-y-3">
            <button onClick={handleRestart} className="w-full py-3 rounded-full flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
          <X className="w-5 h-5" style={{ color: '#6B7280' }} />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Score:</span>
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#3B82F6', fontWeight: 600 }}>{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Round:</span>
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#3B82F6', fontWeight: 600 }}>{roundsPlayed + 1}/{TOTAL_ROUNDS}</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Target Sound Display */}
        <div className="mb-8 text-center p-4 rounded-3xl" style={{ background: 'rgba(255,255,255,0.6)', border: '2px solid #3B82F6' }}>
          <p className="text-xs mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Listen for
          </p>
          <div className="text-5xl mb-2">{TARGET_SOUND.emoji}</div>
          <p className="text-base" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#3B82F6' }}>
            {TARGET_SOUND.name}
          </p>
        </div>

        {/* Current Sound */}
        {isListening && currentSound && (
          <div
            className="mb-8 p-8 rounded-3xl transition-all"
            style={{
              background: feedback === "correct" ? 'rgba(16, 185, 129, 0.2)' :
                          feedback === "incorrect" ? 'rgba(239, 68, 68, 0.2)' :
                          'rgba(255,255,255,0.9)',
              border: `3px solid ${feedback === "correct" ? '#10B981' :
                                   feedback === "incorrect" ? '#EF4444' :
                                   '#3B82F6'}`,
              transform: `scale(${feedback ? 1.05 : 1})`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Volume2 className="w-6 h-6" style={{ color: '#3B82F6' }} />
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1 h-6 rounded-full animate-pulse"
                    style={{
                      background: '#3B82F6',
                      animationDelay: `${i * 150}ms`
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="text-6xl mb-3">{currentSound.emoji}</div>
            <p className="text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#15113C' }}>
              {currentSound.name}
            </p>
          </div>
        )}

        {!isListening && !currentSound && (
          <div className="mb-8 p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <p className="text-base" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
              Listen carefully...
            </p>
          </div>
        )}

        {/* Click Button */}
        <button
          onClick={handleClick}
          disabled={!isListening}
          className="w-32 h-32 rounded-full transition-all active:scale-90 disabled:opacity-40 flex items-center justify-center"
          style={{
            background: isListening ? 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)' : '#E5E7EB',
            boxShadow: isListening ? '0 10px 30px rgba(59, 130, 246, 0.4)' : 'none'
          }}
        >
          <span className="text-3xl">👂</span>
        </button>

        <p className="mt-6 text-sm text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
          {isListening ? "Click when you hear the target!" : "Waiting for next sound..."}
        </p>

        {/* Instructions */}
        <div className="mt-8 p-4 rounded-2xl max-w-sm" style={{ background: 'rgba(255,255,255,0.6)' }}>
          <p className="text-xs text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280', lineHeight: 1.5 }}>
            <strong>How to play:</strong> Click the button only when you see the rain drops. Don't click for other sounds!
          </p>
        </div>
      </div>
    </div>
  );
}

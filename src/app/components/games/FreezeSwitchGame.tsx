import { useState, useEffect, useRef } from "react";
import { Trophy, RotateCcw, X } from "lucide-react";

interface FreezeSwitchGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

type Command = "MOVE" | "FREEZE" | "WALK" | "STOP" | "GO" | "WAIT";

const FREEZE_COMMANDS: Command[] = ["FREEZE", "STOP", "WAIT"];
const MOVE_COMMANDS: Command[] = ["MOVE", "WALK", "GO"];

export function FreezeSwitchGame({ onClose, onComplete }: FreezeSwitchGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [characterPosition, setCharacterPosition] = useState(10); // Percentage
  const [currentCommand, setCurrentCommand] = useState<Command | null>(null);
  const [isMoving, setIsMoving] = useState(true);
  const [itemsCollected, setItemsCollected] = useState(0);
  const [commandsCompleted, setCommandsCompleted] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const TOTAL_COMMANDS = 12;
  const COMMAND_DISPLAY_TIME = 2000; // 2 seconds per command
  const commandTimerRef = useRef<NodeJS.Timeout | null>(null);
  const moveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Move character automatically
  useEffect(() => {
    if (gameState !== "playing") return;

    if (isMoving) {
      moveTimerRef.current = setInterval(() => {
        setCharacterPosition(prev => {
          const next = prev + 2;
          if (next >= 90) {
            setItemsCollected(p => p + 1);
            return 10; // Reset to start
          }
          return next;
        });
      }, 100);
    } else {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    }

    return () => {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    };
  }, [isMoving, gameState]);

  // Show commands
  useEffect(() => {
    if (gameState !== "playing") return;
    if (commandsCompleted >= TOTAL_COMMANDS) {
      setGameState("finished");
      return;
    }

    if (!currentCommand) {
      showNextCommand();
    }
  }, [currentCommand, commandsCompleted, gameState]);

  const showNextCommand = () => {
    const allCommands = [...FREEZE_COMMANDS, ...MOVE_COMMANDS];
    const randomCommand = allCommands[Math.floor(Math.random() * allCommands.length)];

    setCurrentCommand(randomCommand);
    setFeedback(null);

    // Hide command after time and check if user responded correctly
    commandTimerRef.current = setTimeout(() => {
      const isFreezeCommand = FREEZE_COMMANDS.includes(randomCommand);

      // If it was a freeze command and character is still moving, that's an error (user didn't tap)
      if (isFreezeCommand && isMoving) {
        setErrors(prev => prev + 1);
        setFeedback("incorrect");
      }

      // Reset for next command
      setTimeout(() => {
        setCurrentCommand(null);
        setCommandsCompleted(prev => prev + 1);
        setIsMoving(true); // Always resume moving for next command
      }, 300);
    }, COMMAND_DISPLAY_TIME);
  };

  const handleTap = () => {
    if (!currentCommand) return;

    const isFreezeCommand = FREEZE_COMMANDS.includes(currentCommand);

    if (isFreezeCommand) {
      // Correct! User tapped on a freeze command
      setIsMoving(false);
      setScore(prev => prev + 1);
      setFeedback("correct");
    } else {
      // Incorrect! User tapped on a move command (should not tap)
      setErrors(prev => prev + 1);
      setFeedback("incorrect");
    }

    // Clear timer
    if (commandTimerRef.current) clearTimeout(commandTimerRef.current);

    // Move to next command
    setTimeout(() => {
      setCurrentCommand(null);
      setCommandsCompleted(prev => prev + 1);
      setIsMoving(true);
    }, 500);
  };

  const handleRestart = () => {
    setScore(0);
    setErrors(0);
    setCharacterPosition(10);
    setCurrentCommand(null);
    setIsMoving(true);
    setItemsCollected(0);
    setCommandsCompleted(0);
    setFeedback(null);
    setGameState("playing");
  };

  const accuracy = score + errors > 0 ? Math.round((score / (score + errors)) * 100) : 0;

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
            Freeze Switch
          </h2>
          <div className="w-10" />
        </div>

        {/* Results */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
            {score}
          </h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Correct freezes
          </p>

          {/* Stats */}
          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Accuracy</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{accuracy}%</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Items collected</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 600 }}>{itemsCollected}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Errors</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#EF4444', fontWeight: 600 }}>{errors}</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 500 }}>
              {accuracy >= 80 ? "Excellent reaction control! You're a master switcher!" :
               accuracy >= 60 ? "Great attention shifting! Keep practicing." :
               "Good effort! Your reaction speed will improve."}
            </p>
          </div>

          {/* Buttons */}
          <div className="w-full max-w-sm space-y-3">
            <button onClick={handleRestart} className="w-full py-3 rounded-full flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
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
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 600 }}>{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Items:</span>
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 600 }}>{itemsCollected}</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col" onClick={handleTap}>
        {/* Command Display */}
        {currentCommand && (
          <div className="p-6 text-center">
            <div
              className="inline-block px-8 py-4 rounded-3xl transition-all"
              style={{
                background: feedback === "correct" ? 'rgba(16, 185, 129, 0.2)' :
                            feedback === "incorrect" ? 'rgba(239, 68, 68, 0.2)' :
                            FREEZE_COMMANDS.includes(currentCommand) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: `3px solid ${feedback === "correct" ? '#10B981' :
                                     feedback === "incorrect" ? '#EF4444' :
                                     FREEZE_COMMANDS.includes(currentCommand) ? '#EF4444' : '#10B981'}`,
                transform: `scale(${feedback ? 1.05 : 1})`
              }}
            >
              <p className="text-4xl font-bold" style={{ fontFamily: 'Lora, serif', color: '#15113C' }}>
                {currentCommand}
              </p>
            </div>
          </div>
        )}

        {/* Path */}
        <div className="flex-1 flex items-center px-4 relative">
          <div className="w-full h-2 rounded-full relative" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
            {/* Start flag */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
              <span className="text-2xl">🚩</span>
            </div>

            {/* End flag */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2">
              <span className="text-2xl">🏁</span>
            </div>

            {/* Items along path */}
            {[25, 50, 75].map((pos) => (
              <div
                key={pos}
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${pos}%` }}
              >
                <span className="text-xl">⭐</span>
              </div>
            ))}

            {/* Character */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all"
              style={{
                left: `${characterPosition}%`,
                transitionDuration: isMoving ? '100ms' : '200ms'
              }}
            >
              <div className={`text-3xl ${isMoving ? '' : 'animate-pulse'}`}>
                {isMoving ? '🏃' : '🧍'}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6">
          <div className="p-4 rounded-3xl text-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <p className="text-base mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
              {FREEZE_COMMANDS.includes(currentCommand!) ? "TAP NOW!" : "Don't tap!"}
            </p>
            <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280', lineHeight: 1.5 }}>
              Tap when you see: FREEZE, STOP, or WAIT<br />
              Don't tap for: MOVE, WALK, or GO
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 pb-6 flex justify-center gap-1">
          {[...Array(TOTAL_COMMANDS)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: i < commandsCompleted ? '#F59E0B' : 'rgba(245, 158, 11, 0.3)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

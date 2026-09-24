import { useState, useEffect } from "react";
import { Trophy, RotateCcw, X, MapPin } from "lucide-react";

interface PathMemoryGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

type GamePhase = "memorize" | "recall" | "feedback";

interface Cell {
  row: number;
  col: number;
}

const GRID_SIZE = 5;

export function PathMemoryGame({ onClose, onComplete }: PathMemoryGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [phase, setPhase] = useState<GamePhase>("memorize");
  const [correctPath, setCorrectPath] = useState<Cell[]>([]);
  const [userPath, setUserPath] = useState<Cell[]>([]);
  const [distractorPaths, setDistractorPaths] = useState<Cell[][]>([]);
  const [score, setScore] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [memorizationTime, setMemorizationTime] = useState(4);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const TOTAL_ROUNDS = 5;
  const BASE_PATH_LENGTH = 4;

  useEffect(() => {
    if (gameState === "playing" && phase === "memorize" && correctPath.length === 0) {
      generateNewPath();
    }
  }, [phase, gameState, correctPath]);

  useEffect(() => {
    if (phase === "memorize" && correctPath.length > 0) {
      const animationInterval = setInterval(() => {
        setHighlightIndex(prev => {
          if (prev >= correctPath.length - 1) {
            clearInterval(animationInterval);
            setTimeout(() => {
              generateDistractors();
              setPhase("recall");
              setHighlightIndex(-1);
            }, 1000);
            return prev;
          }
          return prev + 1;
        });
      }, memorizationTime * 1000 / correctPath.length);

      return () => clearInterval(animationInterval);
    }
  }, [phase, correctPath, memorizationTime]);

  const generateNewPath = () => {
    const pathLength = BASE_PATH_LENGTH + roundsCompleted;
    const path: Cell[] = [];

    let currentCell = { row: 0, col: 0 };
    path.push({ ...currentCell });

    const directions = [
      { row: 1, col: 0 },
      { row: 0, col: 1 },
      { row: -1, col: 0 },
      { row: 0, col: -1 }
    ];

    while (path.length < pathLength) {
      const validMoves = directions
        .map(dir => ({
          row: currentCell.row + dir.row,
          col: currentCell.col + dir.col
        }))
        .filter(cell =>
          cell.row >= 0 && cell.row < GRID_SIZE &&
          cell.col >= 0 && cell.col < GRID_SIZE &&
          !path.some(p => p.row === cell.row && p.col === cell.col)
        );

      if (validMoves.length === 0) break;

      const nextCell = validMoves[Math.floor(Math.random() * validMoves.length)];
      path.push(nextCell);
      currentCell = nextCell;
    }

    setCorrectPath(path);
    setMemorizationTime(3 + path.length * 0.4);
  };

  const generateDistractors = () => {
    const distractorCount = 1 + Math.floor(roundsCompleted / 2);
    const allDistractors: Cell[][] = [];

    for (let d = 0; d < distractorCount; d++) {
      const distractorLength = 2 + Math.floor(Math.random() * 3);
      const distractor: Cell[] = [];

      const usedCells = [...correctPath];
      allDistractors.forEach(path => usedCells.push(...path));

      let attempts = 0;
      while (distractor.length < distractorLength && attempts < 20) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        if (!usedCells.some(c => c.row === row && c.col === col)) {
          distractor.push({ row, col });
          usedCells.push({ row, col });
        }
        attempts++;
      }

      if (distractor.length > 0) {
        allDistractors.push(distractor);
      }
    }

    setDistractorPaths(allDistractors);
  };

  const handleCellClick = (cell: Cell) => {
    if (phase !== "recall") return;

    const nextIndex = userPath.length;
    const newUserPath = [...userPath, cell];
    setUserPath(newUserPath);

    if (cell.row !== correctPath[nextIndex].row || cell.col !== correctPath[nextIndex].col) {
      setIsCorrect(false);
      setPhase("feedback");

      setTimeout(() => {
        const newRounds = roundsCompleted + 1;
        setRoundsCompleted(newRounds);

        if (newRounds >= TOTAL_ROUNDS) {
          setGameState("finished");
        } else {
          resetRound();
        }
      }, 2000);
      return;
    }

    if (newUserPath.length === correctPath.length) {
      setIsCorrect(true);
      setScore(prev => prev + 1);
      setPhase("feedback");

      setTimeout(() => {
        const newRounds = roundsCompleted + 1;
        setRoundsCompleted(newRounds);

        if (newRounds >= TOTAL_ROUNDS) {
          setGameState("finished");
        } else {
          resetRound();
        }
      }, 1500);
    }
  };

  const resetRound = () => {
    setPhase("memorize");
    setCorrectPath([]);
    setUserPath([]);
    setDistractorPaths([]);
    setIsCorrect(null);
    setHighlightIndex(0);
  };

  const handleRestart = () => {
    setScore(0);
    setRoundsCompleted(0);
    resetRound();
    setGameState("playing");
  };

  const accuracy = TOTAL_ROUNDS > 0 ? Math.round((score / TOTAL_ROUNDS) * 100) : 0;

  const isCellInPath = (row: number, col: number, path: Cell[]) => {
    return path.some(cell => cell.row === row && cell.col === col);
  };

  const getCellIndex = (row: number, col: number, path: Cell[]) => {
    return path.findIndex(cell => cell.row === row && cell.col === col);
  };

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Path Memory</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>{score}/{TOTAL_ROUNDS}</h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Paths remembered</p>

          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Spatial memory</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{accuracy}%</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 500 }}>
              {accuracy === 100 ? "Perfect spatial recall! Amazing navigation!" :
               accuracy >= 80 ? "Excellent path memory!" :
               accuracy >= 60 ? "Good spatial awareness! Keep practicing." :
               "Your spatial memory will improve."}
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

  if (phase === "memorize") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: '#8B5CF6' }} />
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>Memorizing...</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>
            Follow the path
          </p>

          <div className="p-6 rounded-3xl mb-6" style={{ background: 'rgba(255,255,255,0.9)', border: '3px solid #8B5CF6' }}>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
              {Array.from({ length: GRID_SIZE }).map((_, row) => (
                Array.from({ length: GRID_SIZE }).map((_, col) => {
                  const isInPath = isCellInPath(row, col, correctPath);
                  const cellIndex = getCellIndex(row, col, correctPath);
                  const isHighlighted = cellIndex >= 0 && cellIndex <= highlightIndex;
                  const isStart = cellIndex === 0;
                  const isEnd = cellIndex === correctPath.length - 1;

                  return (
                    <div
                      key={`${row}-${col}`}
                      className="w-12 h-12 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: isHighlighted ? 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' :
                                   isInPath ? 'rgba(139, 92, 246, 0.2)' : 'rgba(229, 231, 235, 0.5)',
                        border: isInPath ? '2px solid #8B5CF6' : '2px solid #E5E7EB',
                        transform: isHighlighted ? 'scale(1.1)' : 'scale(1)'
                      }}
                    >
                      {isStart && <span style={{ fontSize: '20px' }}>🎯</span>}
                      {isEnd && isHighlighted && <span style={{ fontSize: '20px' }}>🏁</span>}
                      {isHighlighted && !isStart && !isEnd && (
                        <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: 'white', fontWeight: 700 }}>
                          {cellIndex + 1}
                        </span>
                      )}
                    </div>
                  );
                })
              ))}
            </div>
          </div>

          <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Remember the path from 🎯 to 🏁
          </p>
        </div>
      </div>
    );
  }

  if (phase === "recall") {
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
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>
            Tap the correct path in order
          </p>

          <div className="p-6 rounded-3xl mb-6" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #8B5CF6' }}>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
              {Array.from({ length: GRID_SIZE }).map((_, row) => (
                Array.from({ length: GRID_SIZE }).map((_, col) => {
                  const isInUserPath = isCellInPath(row, col, userPath);
                  const userIndex = getCellIndex(row, col, userPath);
                  const isInDistractor = distractorPaths.some(path => isCellInPath(row, col, path));

                  return (
                    <button
                      key={`${row}-${col}`}
                      onClick={() => handleCellClick({ row, col })}
                      className="w-12 h-12 rounded-lg flex items-center justify-center transition-all active:scale-95"
                      style={{
                        background: isInUserPath ? 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' :
                                   isInDistractor ? 'rgba(239, 68, 68, 0.2)' : 'rgba(229, 231, 235, 0.5)',
                        border: isInDistractor ? '2px solid #EF4444' : '2px solid #E5E7EB'
                      }}
                    >
                      {isInUserPath && (
                        <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: 'white', fontWeight: 700 }}>
                          {userIndex + 1}
                        </span>
                      )}
                    </button>
                  );
                })
              ))}
            </div>
          </div>

          <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Tap step {userPath.length + 1} of {correctPath.length}
          </p>
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
            {isCorrect ? "Perfect path!" : "Wrong turn"}
          </h2>

          {!isCorrect && (
            <p className="text-sm text-center px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
              You made it {userPath.length} step{userPath.length !== 1 ? 's' : ''} out of {correctPath.length}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

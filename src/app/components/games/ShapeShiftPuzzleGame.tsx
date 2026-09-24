import { useState } from "react";
import { Trophy, RotateCcw, X, Grid3x3 } from "lucide-react";

interface ShapeShiftPuzzleGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

type PieceOrientation = 0 | 90 | 180 | 270;

interface PuzzlePiece {
  id: number;
  correctOrientation: PieceOrientation;
  currentOrientation: PieceOrientation;
  shape: "L" | "T" | "I" | "Z";
}

export function ShapeShiftPuzzleGame({ onClose, onComplete }: ShapeShiftPuzzleGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [pieces, setPieces] = useState<PuzzlePiece[]>(generatePuzzle());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const TOTAL_PUZZLES = 5;

  function generatePuzzle(): PuzzlePiece[] {
    const shapes: ("L" | "T" | "I" | "Z")[] = ["L", "T", "I", "Z"];
    const orientations: PieceOrientation[] = [0, 90, 180, 270];

    return Array.from({ length: 4 }, (_, i) => {
      const correctOrientation = orientations[Math.floor(Math.random() * orientations.length)];
      const wrongOrientations = orientations.filter(o => o !== correctOrientation);
      const currentOrientation = wrongOrientations[Math.floor(Math.random() * wrongOrientations.length)];

      return {
        id: i,
        correctOrientation,
        currentOrientation,
        shape: shapes[i]
      };
    });
  }

  const rotatePiece = (pieceId: number) => {
    setPieces(prev =>
      prev.map(piece => {
        if (piece.id === pieceId) {
          const newOrientation = ((piece.currentOrientation + 90) % 360) as PieceOrientation;
          return { ...piece, currentOrientation: newOrientation };
        }
        return piece;
      })
    );
    setMoves(prev => prev + 1);
  };

  const checkSolution = () => {
    const allCorrect = pieces.every(p => p.currentOrientation === p.correctOrientation);

    if (allCorrect) {
      setScore(prev => prev + 1);

      setTimeout(() => {
        if (currentPuzzle < TOTAL_PUZZLES - 1) {
          setCurrentPuzzle(prev => prev + 1);
          setPieces(generatePuzzle());
        } else {
          setGameState("finished");
        }
      }, 1000);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setMoves(0);
    setCurrentPuzzle(0);
    setPieces(generatePuzzle());
    setGameState("playing");
  };

  const efficiency = moves > 0 ? Math.max(0, 100 - Math.floor((moves - TOTAL_PUZZLES * 4) / 2)) : 100;

  const renderPiece = (piece: PuzzlePiece) => {
    const baseStyle = {
      width: '60px',
      height: '60px',
      position: 'relative' as const,
      transform: `rotate(${piece.currentOrientation}deg)`,
      transition: 'transform 0.3s ease'
    };

    const blockStyle = {
      position: 'absolute' as const,
      width: '20px',
      height: '20px',
      background: piece.currentOrientation === piece.correctOrientation ? '#10B981' : '#F59E0B',
      border: '2px solid white',
      borderRadius: '3px'
    };

    const renderBlocks = () => {
      switch (piece.shape) {
        case "L":
          return (
            <>
              <div style={{ ...blockStyle, top: 0, left: 0 }} />
              <div style={{ ...blockStyle, top: 20, left: 0 }} />
              <div style={{ ...blockStyle, top: 40, left: 0 }} />
              <div style={{ ...blockStyle, top: 40, left: 20 }} />
            </>
          );
        case "T":
          return (
            <>
              <div style={{ ...blockStyle, top: 0, left: 20 }} />
              <div style={{ ...blockStyle, top: 20, left: 0 }} />
              <div style={{ ...blockStyle, top: 20, left: 20 }} />
              <div style={{ ...blockStyle, top: 20, left: 40 }} />
            </>
          );
        case "I":
          return (
            <>
              <div style={{ ...blockStyle, top: 0, left: 0 }} />
              <div style={{ ...blockStyle, top: 20, left: 0 }} />
              <div style={{ ...blockStyle, top: 40, left: 0 }} />
            </>
          );
        case "Z":
          return (
            <>
              <div style={{ ...blockStyle, top: 0, left: 0 }} />
              <div style={{ ...blockStyle, top: 0, left: 20 }} />
              <div style={{ ...blockStyle, top: 20, left: 20 }} />
              <div style={{ ...blockStyle, top: 20, left: 40 }} />
            </>
          );
      }
    };

    return (
      <div style={baseStyle}>
        {renderBlocks()}
      </div>
    );
  };

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Shape Shift Puzzle</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>{score}/{TOTAL_PUZZLES}</h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Puzzles solved</p>

          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Spatial reasoning</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>
                  {Math.round((score / TOTAL_PUZZLES) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Total moves</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 600 }}>{moves}</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 500 }}>
              {efficiency >= 80 ? "Excellent spatial thinking!" :
               efficiency >= 60 ? "Great problem-solving!" :
               efficiency >= 40 ? "You're developing flexibility!" :
               "Keep practicing — spatial skills grow!"}
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
          <Grid3x3 className="w-4 h-4" style={{ color: '#F59E0B' }} />
          <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 600 }}>
            Puzzle {currentPuzzle + 1}/{TOTAL_PUZZLES}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <p className="text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 600 }}>
          Tap pieces to rotate them to match the target
        </p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {pieces.map(piece => (
            <button
              key={piece.id}
              onClick={() => rotatePiece(piece.id)}
              className="p-8 rounded-2xl flex items-center justify-center transition-all active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: piece.currentOrientation === piece.correctOrientation ? '3px solid #10B981' : '2px solid #E5E7EB'
              }}
            >
              {renderPiece(piece)}
            </button>
          ))}
        </div>

        <button
          onClick={checkSolution}
          className="w-full max-w-sm py-4 rounded-full transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
        >
          Check Solution
        </button>

        <p className="text-xs mt-4 text-center px-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
          Green pieces are correctly oriented
        </p>
      </div>
    </div>
  );
}

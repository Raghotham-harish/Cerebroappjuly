import { useState, useEffect, useRef } from "react";
import { Trophy, RotateCcw, X as XIcon } from "lucide-react";

interface DistractionDodgeGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface Shape {
  id: string;
  type: "circle" | "square" | "triangle";
  color: string;
}

interface Distraction {
  id: string;
  type: "ad" | "notification" | "emoji";
  content: string;
  position: { top: number; left: number };
}

const DISTRACTIONS_CONTENT = [
  { type: "ad", content: "🎁 CLICK HERE FOR FREE PRIZE!" },
  { type: "ad", content: "⚠️ YOUR PHONE HAS A VIRUS!" },
  { type: "ad", content: "💰 MAKE $1000 TODAY!" },
  { type: "notification", content: "📱 You have 99+ messages!" },
  { type: "notification", content: "🔔 New notification!" },
  { type: "emoji", content: "🎉" },
  { type: "emoji", content: "🐱" },
  { type: "emoji", content: "🍕" },
  { type: "emoji", content: "🎮" },
  { type: "emoji", content: "🎸" }
];

export function DistractionDodgeGame({ onClose, onComplete }: DistractionDodgeGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [score, setScore] = useState(0);
  const [distractionsClicked, setDistractionsClicked] = useState(0);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [distractions, setDistractions] = useState<Distraction[]>([]);
  const [shapesCompleted, setShapesCompleted] = useState(0);

  const TOTAL_SHAPES = 15;
  const distractionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const COLORS = ["#EF4444", "#3B82F6", "#10B981"];
  const SHAPES: ("circle" | "square" | "triangle")[] = ["circle", "square", "triangle"];

  useEffect(() => {
    if (gameState === "playing") {
      if (!currentShape) {
        generateNewShape();
      }
      startDistractionsTimer();
    }

    return () => {
      if (distractionTimerRef.current) clearInterval(distractionTimerRef.current);
    };
  }, [currentShape, gameState]);

  const generateNewShape = () => {
    if (shapesCompleted >= TOTAL_SHAPES) {
      setGameState("finished");
      return;
    }

    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    setCurrentShape({
      id: Date.now().toString(),
      type: randomShape,
      color: randomColor
    });
  };

  const startDistractionsTimer = () => {
    // Add distraction every 2-4 seconds
    distractionTimerRef.current = setInterval(() => {
      addDistraction();
    }, 2000 + Math.random() * 2000);
  };

  const addDistraction = () => {
    const randomContent = DISTRACTIONS_CONTENT[Math.floor(Math.random() * DISTRACTIONS_CONTENT.length)];
    const newDistraction: Distraction = {
      id: Date.now().toString(),
      type: randomContent.type as "ad" | "notification" | "emoji",
      content: randomContent.content,
      position: {
        top: 20 + Math.random() * 50, // 20-70%
        left: 10 + Math.random() * 70  // 10-80%
      }
    };

    setDistractions(prev => [...prev, newDistraction]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setDistractions(prev => prev.filter(d => d.id !== newDistraction.id));
    }, 3000);
  };

  const handleBoxClick = (boxColor: string) => {
    if (!currentShape) return;

    if (currentShape.color === boxColor) {
      // Correct!
      setScore(prev => prev + 1);
      setShapesCompleted(prev => prev + 1);
      setCurrentShape(null);
    }
  };

  const handleDistractionClick = (id: string) => {
    setDistractionsClicked(prev => prev + 1);
    setDistractions(prev => prev.filter(d => d.id !== id));
  };

  const handleRestart = () => {
    setScore(0);
    setDistractionsClicked(0);
    setCurrentShape(null);
    setDistractions([]);
    setShapesCompleted(0);
    setGameState("playing");
  };

  const accuracy = shapesCompleted > 0 ? Math.round((score / shapesCompleted) * 100) : 0;

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <XIcon className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
            Distraction Dodge
          </h2>
          <div className="w-10" />
        </div>

        {/* Results */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
            {score}/{shapesCompleted}
          </h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Shapes sorted correctly
          </p>

          {/* Stats */}
          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Focus accuracy</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{accuracy}%</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Shapes sorted</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>{score}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Distractions clicked</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#EF4444', fontWeight: 600 }}>{distractionsClicked}</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 500 }}>
              {distractionsClicked === 0 && accuracy >= 90 ? "Perfect focus! You ignored all distractions!" :
               distractionsClicked <= 2 ? "Excellent sustained attention! Keep it up." :
               distractionsClicked <= 5 ? "Good focus! With practice you'll improve." :
               "Keep practicing! Your attention will strengthen."}
            </p>
          </div>

          {/* Buttons */}
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

  const renderShape = (shape: Shape) => {
    if (shape.type === "circle") {
      return <div className="w-16 h-16 rounded-full" style={{ background: shape.color }} />;
    } else if (shape.type === "square") {
      return <div className="w-16 h-16" style={{ background: shape.color }} />;
    } else {
      return (
        <div className="w-16 h-16 relative flex items-center justify-center">
          <div
            className="w-0 h-0 border-l-8 border-r-8 border-b-16"
            style={{
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: shape.color,
              borderBottomWidth: '60px',
              borderLeftWidth: '32px',
              borderRightWidth: '32px'
            }}
          />
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
          <XIcon className="w-5 h-5" style={{ color: '#6B7280' }} />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Sorted:</span>
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 600 }}>{score}/{TOTAL_SHAPES}</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Current Shape */}
        <div className="p-6 flex justify-center items-center">
          {currentShape && (
            <div className="p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.8)', border: '2px solid #E5E7EB' }}>
              <p className="text-xs text-center mb-3" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
                Tap the matching box
              </p>
              {renderShape(currentShape)}
            </div>
          )}
        </div>

        {/* Color Boxes */}
        <div className="flex-1 flex items-center justify-center gap-4 px-4">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleBoxClick(color)}
              className="w-24 h-24 rounded-2xl transition-all active:scale-90"
              style={{
                background: color,
                opacity: 0.8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
          ))}
        </div>

        {/* Distractions */}
        {distractions.map((distraction) => (
          <button
            key={distraction.id}
            onClick={() => handleDistractionClick(distraction.id)}
            className="absolute px-4 py-2 rounded-2xl shadow-lg transition-all animate-pulse"
            style={{
              top: `${distraction.position.top}%`,
              left: `${distraction.position.left}%`,
              background: distraction.type === "ad" ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' :
                          distraction.type === "notification" ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' :
                          'white',
              color: distraction.type === "emoji" ? '#15113C' : 'white',
              fontFamily: 'Inter, sans-serif',
              fontSize: distraction.type === "emoji" ? '32px' : '11px',
              fontWeight: 700,
              border: distraction.type === "emoji" ? '2px solid #E5E7EB' : 'none',
              zIndex: 40
            }}
          >
            {distraction.content}
          </button>
        ))}

        {/* Instructions */}
        <div className="p-4">
          <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
              Sort shapes by color. Ignore the distractions!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

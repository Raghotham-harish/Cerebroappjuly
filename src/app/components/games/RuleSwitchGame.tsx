import { useState, useEffect, useRef } from "react";
import { Trophy, RotateCcw, X, Zap } from "lucide-react";

interface RuleSwitchGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface Shape {
  type: "circle" | "square" | "triangle";
  color: "red" | "blue" | "green";
}

interface Rule {
  description: string;
  check: (shape: Shape) => boolean;
  banner: string;
}

const RULES: Rule[] = [
  {
    description: "Tap circles",
    check: (shape) => shape.type === "circle",
    banner: "TAP CIRCLES"
  },
  {
    description: "Tap squares",
    check: (shape) => shape.type === "square",
    banner: "TAP SQUARES"
  },
  {
    description: "Tap triangles",
    check: (shape) => shape.type === "triangle",
    banner: "TAP TRIANGLES"
  },
  {
    description: "Tap red shapes",
    check: (shape) => shape.color === "red",
    banner: "TAP RED"
  },
  {
    description: "Tap blue shapes",
    check: (shape) => shape.color === "blue",
    banner: "TAP BLUE"
  },
  {
    description: "Tap green shapes",
    check: (shape) => shape.color === "green",
    banner: "TAP GREEN"
  }
];

export function RuleSwitchGame({ onClose, onComplete }: RuleSwitchGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [currentRule, setCurrentRule] = useState<Rule>(RULES[0]);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [shapesShown, setShapesShown] = useState(0);
  const [showRuleBanner, setShowRuleBanner] = useState(true);
  const [ruleJustSwitched, setRuleJustSwitched] = useState(false);

  const shapeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ruleSwitchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const TOTAL_SHAPES = 30;
  const SWITCH_FREQUENCY = 5;

  const SHAPE_TYPES: ("circle" | "square" | "triangle")[] = ["circle", "square", "triangle"];
  const COLORS: ("red" | "blue" | "green")[] = ["red", "blue", "green"];

  const COLOR_MAP = {
    red: "#EF4444",
    blue: "#3B82F6",
    green: "#10B981"
  };

  useEffect(() => {
    if (gameState === "playing") {
      generateNewShape();
      scheduleRuleSwitch();
    }

    return () => {
      if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current);
      if (ruleSwitchTimerRef.current) clearTimeout(ruleSwitchTimerRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (shapesShown >= TOTAL_SHAPES) {
      setGameState("finished");
    }
  }, [shapesShown]);

  const generateNewShape = () => {
    const randomType = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    setCurrentShape({ type: randomType, color: randomColor });
  };

  const scheduleRuleSwitch = () => {
    const interval = 8000 + Math.random() * 4000;

    ruleSwitchTimerRef.current = setTimeout(() => {
      switchRule();
      if (gameState === "playing") {
        scheduleRuleSwitch();
      }
    }, interval);
  };

  const switchRule = () => {
    const availableRules = RULES.filter(r => r.description !== currentRule.description);
    const newRule = availableRules[Math.floor(Math.random() * availableRules.length)];

    setCurrentRule(newRule);
    setShowRuleBanner(true);
    setRuleJustSwitched(true);

    setTimeout(() => setShowRuleBanner(false), 2500);
    setTimeout(() => setRuleJustSwitched(false), 500);
  };

  const handleTap = () => {
    if (!currentShape) return;

    const shouldTap = currentRule.check(currentShape);

    if (shouldTap) {
      setScore(prev => prev + 1);
    } else {
      setErrors(prev => prev + 1);
    }

    nextShape();
  };

  const handleSkip = () => {
    if (!currentShape) return;

    const shouldSkip = !currentRule.check(currentShape);

    if (shouldSkip) {
      setScore(prev => prev + 1);
    } else {
      setErrors(prev => prev + 1);
    }

    nextShape();
  };

  const nextShape = () => {
    setShapesShown(prev => prev + 1);
    if (shapesShown + 1 < TOTAL_SHAPES) {
      generateNewShape();
    }
  };

  const handleRestart = () => {
    setScore(0);
    setErrors(0);
    setShapesShown(0);
    setCurrentRule(RULES[0]);
    setShowRuleBanner(true);
    setGameState("playing");
  };

  const accuracy = (shapesShown > 0) ? Math.round((score / shapesShown) * 100) : 0;

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Rule Switch</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>{score}/{shapesShown}</h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Correct responses</p>

          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Adaptability</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{accuracy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Errors</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#EF4444', fontWeight: 600 }}>{errors}</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 500 }}>
              {accuracy >= 85 ? "Amazing mental flexibility!" :
               accuracy >= 70 ? "Great adaptability! Keep it up." :
               accuracy >= 55 ? "You're building flexibility!" :
               "Switching takes practice! You're learning."}
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

  const renderShape = (shape: Shape) => {
    const color = COLOR_MAP[shape.color];

    if (shape.type === "circle") {
      return <div className="w-32 h-32 rounded-full" style={{ background: color }} />;
    } else if (shape.type === "square") {
      return <div className="w-32 h-32" style={{ background: color }} />;
    } else {
      return (
        <div className="w-32 h-32 relative flex items-center justify-center">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '64px solid transparent',
              borderRight: '64px solid transparent',
              borderBottom: `120px solid ${color}`
            }}
          />
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
          <X className="w-5 h-5" style={{ color: '#6B7280' }} />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: '#F59E0B' }} />
          <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#F59E0B', fontWeight: 600 }}>
            {shapesShown}/{TOTAL_SHAPES}
          </span>
        </div>
      </div>

      {showRuleBanner && (
        <div
          className="p-4 text-center animate-pulse"
          style={{
            background: ruleJustSwitched ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : 'rgba(251, 191, 36, 0.2)',
            borderBottom: '2px solid #FBBF24'
          }}
        >
          <p className="text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: ruleJustSwitched ? 'white' : '#92400E' }}>
            {ruleJustSwitched && "⚡ RULE CHANGED! ⚡ "}
            {currentRule.banner}
          </p>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="p-4 rounded-2xl mb-6" style={{ background: 'rgba(251, 191, 36, 0.2)', border: '2px solid #FBBF24' }}>
          <p className="text-base text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#92400E' }}>
            {currentRule.description}
          </p>
        </div>

        {currentShape && (
          <div className="mb-12">
            {renderShape(currentShape)}
          </div>
        )}

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={handleTap}
            className="w-full py-6 rounded-2xl transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '18px' }}
          >
            TAP
          </button>

          <button
            onClick={handleSkip}
            className="w-full py-6 rounded-2xl transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB', color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '18px' }}
          >
            SKIP
          </button>
        </div>

        <p className="text-xs mt-6 text-center px-6" style={{ fontFamily: 'Inter, sans-serif', color: '#92400E' }}>
          Watch for rule changes! ⚡
        </p>
      </div>
    </div>
  );
}

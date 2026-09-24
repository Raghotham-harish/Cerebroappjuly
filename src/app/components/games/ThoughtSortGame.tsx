import { useState } from "react";
import { Trophy, RotateCcw, X, Brain, ThumbsUp, ThumbsDown } from "lucide-react";

interface ThoughtSortGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface Thought {
  text: string;
  isHelpful: boolean;
  explanation: string;
}

const THOUGHTS: Thought[] = [
  {
    text: "I made a mistake, but I can learn from it",
    isHelpful: true,
    explanation: "This thought promotes growth and learning"
  },
  {
    text: "I always mess everything up",
    isHelpful: false,
    explanation: "This is an overgeneralization that's not helpful"
  },
  {
    text: "This is challenging, but I can handle it",
    isHelpful: true,
    explanation: "This shows resilience and self-belief"
  },
  {
    text: "I'm worthless",
    isHelpful: false,
    explanation: "This is harmful self-criticism"
  },
  {
    text: "I'll try my best and that's enough",
    isHelpful: true,
    explanation: "This is self-compassionate and realistic"
  },
  {
    text: "Nobody likes me",
    isHelpful: false,
    explanation: "This is an all-or-nothing thought pattern"
  },
  {
    text: "I can ask for help when I need it",
    isHelpful: true,
    explanation: "This shows healthy connection-seeking"
  },
  {
    text: "I should be perfect at everything",
    isHelpful: false,
    explanation: "Perfectionism creates unnecessary pressure"
  },
  {
    text: "It's okay to feel uncomfortable sometimes",
    isHelpful: true,
    explanation: "This normalizes difficult emotions"
  },
  {
    text: "I can't do anything right",
    isHelpful: false,
    explanation: "This is catastrophizing and unhelpful"
  },
  {
    text: "I'm doing the best I can right now",
    isHelpful: true,
    explanation: "This is kind and validating"
  },
  {
    text: "Everyone else is better than me",
    isHelpful: false,
    explanation: "This is comparison-based and demoralizing"
  },
  {
    text: "I've overcome challenges before",
    isHelpful: true,
    explanation: "This draws on past strengths"
  },
  {
    text: "I'll never get better",
    isHelpful: false,
    explanation: "This blocks hope and progress"
  },
  {
    text: "My feelings are valid",
    isHelpful: true,
    explanation: "This validates emotional experience"
  }
];

type GamePhase = "sorting" | "feedback";

export function ThoughtSortGame({ onClose, onComplete }: ThoughtSortGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [phase, setPhase] = useState<GamePhase>("sorting");
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
  const [shuffledThoughts, setShuffledThoughts] = useState<Thought[]>(
    [...THOUGHTS].sort(() => Math.random() - 0.5).slice(0, 10)
  );
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const TOTAL_THOUGHTS = 10;

  const currentThought = shuffledThoughts[currentThoughtIndex];

  const handleSort = (chosenHelpful: boolean) => {
    const correct = chosenHelpful === currentThought.isHelpful;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
    }

    setPhase("feedback");

    setTimeout(() => {
      if (currentThoughtIndex < TOTAL_THOUGHTS - 1) {
        setCurrentThoughtIndex(prev => prev + 1);
        setPhase("sorting");
        setIsCorrect(null);
      } else {
        setGameState("finished");
      }
    }, 2500);
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentThoughtIndex(0);
    setShuffledThoughts([...THOUGHTS].sort(() => Math.random() - 0.5).slice(0, 10));
    setIsCorrect(null);
    setPhase("sorting");
    setGameState("playing");
  };

  const accuracy = TOTAL_THOUGHTS > 0 ? Math.round((score / TOTAL_THOUGHTS) * 100) : 0;

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Thought Sort</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>{score}/{TOTAL_THOUGHTS}</h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Thoughts sorted correctly</p>

          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Thought awareness</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{accuracy}%</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 500 }}>
              {accuracy === 100 ? "Perfect cognitive awareness!" :
               accuracy >= 80 ? "Excellent thought recognition!" :
               accuracy >= 60 ? "Good progress! Keep practicing." :
               "You're learning to recognize patterns!"}
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

  if (phase === "sorting") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" style={{ color: '#10B981' }} />
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>
              {currentThoughtIndex + 1}/{TOTAL_THOUGHTS}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>
            Is this thought helpful or unhelpful?
          </p>

          <div className="p-6 rounded-3xl mb-8 max-w-md" style={{ background: 'rgba(255,255,255,0.9)', border: '3px solid #10B981' }}>
            <p className="text-lg text-center leading-relaxed" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
              "{currentThought.text}"
            </p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={() => handleSort(true)}
              className="w-full p-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)', border: '2px solid #10B981' }}
            >
              <ThumbsUp className="w-6 h-6" style={{ color: 'white' }} />
              <span className="text-base" style={{ color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Helpful
              </span>
            </button>

            <button
              onClick={() => handleSort(false)}
              className="w-full p-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #EF4444' }}
            >
              <ThumbsDown className="w-6 h-6" style={{ color: '#EF4444' }} />
              <span className="text-base" style={{ color: '#EF4444', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Unhelpful
              </span>
            </button>
          </div>

          <p className="text-xs mt-6 text-center px-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Helpful thoughts support your wellbeing and growth
          </p>
        </div>
      </div>
    );
  }

  if (phase === "feedback") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
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
            {isCorrect ? "That's right!" : "Not quite"}
          </h2>

          <div className="p-5 rounded-2xl max-w-md mb-4" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <p className="text-sm text-center mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
              This thought is <strong>{currentThought.isHelpful ? "helpful" : "unhelpful"}</strong>
            </p>
            <p className="text-xs text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
              {currentThought.explanation}
            </p>
          </div>

          {!isCorrect && (
            <p className="text-sm text-center px-6" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 500 }}>
              Recognizing thought patterns takes practice!
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

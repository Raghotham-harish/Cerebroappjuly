import { useState, useEffect } from "react";
import { Trophy, RotateCcw, X } from "lucide-react";

interface PatternRecallGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

type Symbol = "●" | "■" | "▲" | "◆" | "★" | "♥" | "◐" | "✦";

const SYMBOLS: Symbol[] = ["●", "■", "▲", "◆", "★", "♥", "◐", "✦"];

type GamePhase = "memorize" | "question" | "feedback";
type QuestionType = "position" | "missing";

interface Question {
  type: QuestionType;
  text: string;
  correctAnswer: Symbol;
  options: Symbol[];
}

export function PatternRecallGame({ onClose, onComplete }: PatternRecallGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [phase, setPhase] = useState<GamePhase>("memorize");
  const [sequence, setSequence] = useState<Symbol[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [memorizationTime, setMemorizationTime] = useState(3);

  const TOTAL_ROUNDS = 5;
  const BASE_SEQUENCE_LENGTH = 3;

  useEffect(() => {
    if (gameState === "playing" && phase === "memorize" && sequence.length === 0) {
      generateNewSequence();
    }
  }, [phase, gameState, sequence]);

  useEffect(() => {
    if (phase === "memorize" && sequence.length > 0) {
      const timer = setTimeout(() => {
        setPhase("question");
        generateQuestion();
      }, memorizationTime * 1000);

      return () => clearTimeout(timer);
    }
  }, [phase, sequence, memorizationTime]);

  const generateNewSequence = () => {
    const length = BASE_SEQUENCE_LENGTH + Math.floor(roundsCompleted / 2); // Increase difficulty
    const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5);
    const newSequence = shuffled.slice(0, Math.min(length, SYMBOLS.length));
    setSequence(newSequence);
    setMemorizationTime(2 + length * 0.5); // More time for longer sequences
  };

  const generateQuestion = () => {
    const questionType: QuestionType = Math.random() < 0.5 ? "position" : "missing";

    if (questionType === "position") {
      // Ask which symbol was at position X
      const position = Math.floor(Math.random() * sequence.length);
      const correctAnswer = sequence[position];

      // Generate wrong options
      const wrongOptions = SYMBOLS.filter(s => !sequence.includes(s));
      const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);

      const allOptions = [correctAnswer, ...shuffledWrong].sort(() => Math.random() - 0.5);

      setQuestion({
        type: "position",
        text: `Which symbol was in position ${position + 1}?`,
        correctAnswer,
        options: allOptions
      });
    } else {
      // Ask which symbol was NOT in the sequence
      const notInSequence = SYMBOLS.filter(s => !sequence.includes(s));
      const correctAnswer = notInSequence[Math.floor(Math.random() * notInSequence.length)];

      // Generate options (3 from sequence + 1 not in sequence)
      const wrongOptions = sequence.sort(() => Math.random() - 0.5).slice(0, 3);
      const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);

      setQuestion({
        type: "missing",
        text: "Which symbol was NOT in the sequence?",
        correctAnswer,
        options: allOptions
      });
    }
  };

  const handleAnswer = (answer: Symbol) => {
    const correct = answer === question?.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
    }

    setPhase("feedback");

    setTimeout(() => {
      const newRounds = roundsCompleted + 1;
      setRoundsCompleted(newRounds);

      if (newRounds >= TOTAL_ROUNDS) {
        setGameState("finished");
      } else {
        setPhase("memorize");
        setSequence([]);
        setQuestion(null);
        setIsCorrect(null);
      }
    }, 1500);
  };

  const handleRestart = () => {
    setScore(0);
    setRoundsCompleted(0);
    setSequence([]);
    setQuestion(null);
    setIsCorrect(null);
    setPhase("memorize");
    setGameState("playing");
  };

  const accuracy = TOTAL_ROUNDS > 0 ? Math.round((score / TOTAL_ROUNDS) * 100) : 0;

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
            Pattern Recall
          </h2>
          <div className="w-10" />
        </div>

        {/* Results */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
            {score}/{TOTAL_ROUNDS}
          </h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Patterns recalled
          </p>

          {/* Stats */}
          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Memory accuracy</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{accuracy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Correct answers</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>{score}</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 500 }}>
              {accuracy === 100 ? "Perfect working memory! Outstanding!" :
               accuracy >= 80 ? "Excellent memory recall! Keep it sharp." :
               accuracy >= 60 ? "Good memory work! Practice makes perfect." :
               "Keep training! Your memory will strengthen."}
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

  if (phase === "memorize") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Round:</span>
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>{roundsCompleted + 1}/{TOTAL_ROUNDS}</span>
          </div>
        </div>

        {/* Memorization Phase */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-base mb-8" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>
            Memorize this sequence
          </p>

          <div className="flex flex-wrap justify-center gap-4 max-w-md mb-8">
            {sequence.map((symbol, index) => (
              <div
                key={index}
                className="w-20 h-20 rounded-2xl flex items-center justify-center animate-pulse"
                style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #8B5CF6' }}
              >
                <span className="text-5xl">{symbol}</span>
              </div>
            ))}
          </div>

          <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Remember the order and symbols...
          </p>
        </div>
      </div>
    );
  }

  if (phase === "question" && question) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Score:</span>
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>{score}/{roundsCompleted}</span>
          </div>
        </div>

        {/* Question Phase */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="p-6 rounded-3xl mb-8 max-w-md" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #8B5CF6' }}>
            <p className="text-lg text-center" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
              {question.text}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm w-full">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full aspect-square rounded-2xl flex items-center justify-center transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}
              >
                <span className="text-6xl">{option}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "feedback") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <div className="w-10" />
        </div>

        {/* Feedback */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
            style={{ background: isCorrect ? 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' : 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)' }}
          >
            <span className="text-6xl">{isCorrect ? "✓" : "✗"}</span>
          </div>

          <h2 className="text-3xl mb-4" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
            {isCorrect ? "Correct!" : "Not quite"}
          </h2>

          {!isCorrect && question && (
            <p className="text-base mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
              The answer was: <span className="text-4xl">{question.correctAnswer}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

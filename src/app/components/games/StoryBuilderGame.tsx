import { useState } from "react";
import { Trophy, RotateCcw, X, BookOpen } from "lucide-react";

interface StoryBuilderGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface StorySegment {
  text: string;
  question: string;
  correctAnswer: string;
  options: string[];
}

const STORY_SEGMENTS: StorySegment[] = [
  {
    text: "Maya woke up feeling anxious about her presentation. She took a deep breath and decided to practice one more time.",
    question: "How did Maya feel when she woke up?",
    correctAnswer: "Anxious",
    options: ["Excited", "Anxious", "Tired", "Happy"]
  },
  {
    text: "Her colleague Alex noticed her nervousness and offered to listen to her practice. Maya felt grateful for his support.",
    question: "What did Alex do to help Maya?",
    correctAnswer: "Offered to listen to her practice",
    options: ["Gave her coffee", "Offered to listen to her practice", "Made a joke", "Left her alone"]
  },
  {
    text: "During the presentation, Maya stumbled on a slide but quickly recovered. She noticed her manager nodding encouragingly.",
    question: "What happened during Maya's presentation?",
    correctAnswer: "She stumbled but recovered",
    options: ["Everything went perfectly", "She stumbled but recovered", "She forgot her notes", "She started crying"]
  },
  {
    text: "After the presentation, Maya's team applauded. She felt relieved and proud of pushing through her anxiety.",
    question: "How did Maya feel after the presentation?",
    correctAnswer: "Relieved and proud",
    options: ["Disappointed", "Relieved and proud", "Still anxious", "Angry"]
  },
  {
    text: "That evening, Maya reflected on how Alex's kindness and her manager's encouragement helped her succeed. She decided to pay it forward by mentoring a new team member.",
    question: "What did Maya decide to do after reflecting?",
    correctAnswer: "Mentor a new team member",
    options: ["Quit her job", "Mentor a new team member", "Avoid presentations", "Thank her manager"]
  }
];

type GamePhase = "story" | "question" | "feedback";

export function StoryBuilderGame({ onClose, onComplete }: StoryBuilderGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [phase, setPhase] = useState<GamePhase>("story");
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [fullStory, setFullStory] = useState<string[]>([]);

  const currentSegment = STORY_SEGMENTS[currentSegmentIndex];

  const handleContinue = () => {
    // Add current segment to full story
    setFullStory(prev => [...prev, currentSegment.text]);
    setPhase("question");
  };

  const handleAnswer = (answer: string) => {
    const correct = answer === currentSegment.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
    }

    setPhase("feedback");

    setTimeout(() => {
      if (currentSegmentIndex < STORY_SEGMENTS.length - 1) {
        setCurrentSegmentIndex(prev => prev + 1);
        setPhase("story");
        setIsCorrect(null);
      } else {
        setGameState("finished");
      }
    }, 1500);
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentSegmentIndex(0);
    setFullStory([]);
    setIsCorrect(null);
    setPhase("story");
    setGameState("playing");
  };

  const accuracy = STORY_SEGMENTS.length > 0 ? Math.round((score / STORY_SEGMENTS.length) * 100) : 0;

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Story Builder</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>{score}/{STORY_SEGMENTS.length}</h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Story details remembered</p>

          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Sequential memory</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{accuracy}%</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 500 }}>
              {accuracy === 100 ? "Perfect story recall! Amazing comprehension!" :
               accuracy >= 80 ? "Excellent sequential memory!" :
               accuracy >= 60 ? "Good story tracking! Keep practicing." :
               "Your memory will strengthen with practice."}
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

  if (phase === "story") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: '#8B5CF6' }} />
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>Chapter {currentSegmentIndex + 1}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-4 overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto py-8">
            {/* Previous story parts */}
            {fullStory.length > 0 && (
              <div className="mb-6 p-4 rounded-3xl" style={{ background: 'rgba(255,255,255,0.5)', border: '2px solid rgba(139, 92, 246, 0.3)' }}>
                <p className="text-xs mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>STORY SO FAR...</p>
                {fullStory.map((segment, i) => (
                  <p key={i} className="text-xs mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280', lineHeight: 1.6 }}>
                    {segment}
                  </p>
                ))}
              </div>
            )}

            {/* Current segment */}
            <div className="p-6 rounded-3xl mb-6" style={{ background: 'rgba(255,255,255,0.9)', border: '3px solid #8B5CF6' }}>
              <p className="text-base leading-relaxed" style={{ fontFamily: 'Lora, serif', color: '#15113C', lineHeight: 1.8 }}>
                {currentSegment.text}
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-3 rounded-full"
              style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "question") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Score: </span>
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>{score}/{currentSegmentIndex}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="p-6 rounded-3xl mb-8 max-w-md" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #8B5CF6' }}>
            <p className="text-lg text-center leading-relaxed" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
              {currentSegment.question}
            </p>
          </div>

          <div className="w-full max-w-md space-y-3">
            {currentSegment.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full p-4 rounded-2xl text-left transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}
              >
                <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 500 }}>
                  {option}
                </p>
              </button>
            ))}
          </div>
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
            {isCorrect ? "Correct!" : "Not quite"}
          </h2>

          {!isCorrect && (
            <div className="p-4 rounded-2xl max-w-md" style={{ background: 'rgba(255,255,255,0.6)' }}>
              <p className="text-sm text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
                The answer was: <strong>{currentSegment.correctAnswer}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

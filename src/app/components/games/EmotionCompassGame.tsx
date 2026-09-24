import { useState } from "react";
import { Trophy, RotateCcw, X, Compass, Heart } from "lucide-react";

interface EmotionCompassGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface EmotionScenario {
  scenario: string;
  emotion: string;
  options: string[];
  copingStrategy: string;
  emoji: string;
}

const EMOTION_SCENARIOS: EmotionScenario[] = [
  {
    scenario: "Your friend canceled plans at the last minute",
    emotion: "Disappointed",
    options: ["Disappointed", "Excited", "Proud", "Confused"],
    copingStrategy: "It's okay to feel let down. You could try reaching out to share how you feel, or plan something nice for yourself instead.",
    emoji: "😞"
  },
  {
    scenario: "You completed a difficult project successfully",
    emotion: "Proud",
    options: ["Anxious", "Proud", "Angry", "Bored"],
    copingStrategy: "Celebrate your achievement! Take time to acknowledge your hard work and share your success with supportive people.",
    emoji: "😊"
  },
  {
    scenario: "Someone criticized your work unfairly",
    emotion: "Frustrated",
    options: ["Happy", "Frustrated", "Excited", "Calm"],
    copingStrategy: "Take a deep breath. Consider if there's any valid feedback, but remember that unfair criticism says more about them than you.",
    emoji: "😤"
  },
  {
    scenario: "You're waiting for important news and it's taking a long time",
    emotion: "Anxious",
    options: ["Anxious", "Joyful", "Angry", "Confident"],
    copingStrategy: "Try grounding techniques like deep breathing or the 5-4-3-2-1 method. Focus on what you can control right now.",
    emoji: "😰"
  },
  {
    scenario: "A loved one shared good news with you",
    emotion: "Happy",
    options: ["Sad", "Happy", "Worried", "Tired"],
    copingStrategy: "Enjoy this positive feeling! Sharing joy strengthens connections. Express your happiness and celebrate together.",
    emoji: "😄"
  },
  {
    scenario: "You made a mistake in front of others",
    emotion: "Embarrassed",
    options: ["Embarrassed", "Excited", "Peaceful", "Energized"],
    copingStrategy: "Remember that everyone makes mistakes. Practice self-compassion and remind yourself that this moment will pass.",
    emoji: "😳"
  },
  {
    scenario: "Your plans changed unexpectedly",
    emotion: "Uncertain",
    options: ["Certain", "Uncertain", "Delighted", "Angry"],
    copingStrategy: "It's normal to feel unsettled by change. Take time to process, then focus on adapting to the new situation.",
    emoji: "🤔"
  },
  {
    scenario: "Someone didn't listen to what you had to say",
    emotion: "Unheard",
    options: ["Thrilled", "Unheard", "Relaxed", "Amused"],
    copingStrategy: "Your voice matters. You can try expressing yourself again clearly, or find someone who will truly listen.",
    emoji: "😔"
  },
  {
    scenario: "You're about to try something new",
    emotion: "Nervous",
    options: ["Bored", "Nervous", "Angry", "Sad"],
    copingStrategy: "Nervousness shows you care. Channel it into excitement! Remember, growth happens outside comfort zones.",
    emoji: "😬"
  },
  {
    scenario: "You finished all your tasks for the day",
    emotion: "Relieved",
    options: ["Stressed", "Relieved", "Guilty", "Scared"],
    copingStrategy: "Enjoy this sense of accomplishment! Take time to rest and recharge before tomorrow.",
    emoji: "😌"
  }
];

type GamePhase = "scenario" | "feedback";

export function EmotionCompassGame({ onClose, onComplete }: EmotionCompassGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [phase, setPhase] = useState<GamePhase>("scenario");
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [shuffledScenarios, setShuffledScenarios] = useState<EmotionScenario[]>(
    [...EMOTION_SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 8)
  );
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const TOTAL_SCENARIOS = 8;

  const currentScenario = shuffledScenarios[currentScenarioIndex];

  const handleAnswer = (chosenEmotion: string) => {
    const correct = chosenEmotion === currentScenario.emotion;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
    }

    setPhase("feedback");
  };

  const handleContinue = () => {
    if (currentScenarioIndex < TOTAL_SCENARIOS - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
      setPhase("scenario");
      setIsCorrect(null);
    } else {
      setGameState("finished");
    }
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentScenarioIndex(0);
    setShuffledScenarios([...EMOTION_SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 8));
    setIsCorrect(null);
    setPhase("scenario");
    setGameState("playing");
  };

  const accuracy = TOTAL_SCENARIOS > 0 ? Math.round((score / TOTAL_SCENARIOS) * 100) : 0;

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Emotion Compass</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>{score}/{TOTAL_SCENARIOS}</h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Emotions identified</p>

          <div className="w-full max-w-sm mb-8">
            <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Emotional awareness</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{accuracy}%</span>
              </div>
            </div>

            <p className="text-center text-sm px-4" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 500 }}>
              {accuracy === 100 ? "Perfect emotional navigation! 🧭✨" :
               accuracy >= 75 ? "Great emotional awareness! 💚" :
               accuracy >= 50 ? "You're building emotional intelligence!" :
               "Every emotion you name strengthens your compass!"}
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

  if (phase === "scenario") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4" style={{ color: '#10B981' }} />
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>
              {currentScenarioIndex + 1}/{TOTAL_SCENARIOS}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>
            How might you feel in this situation?
          </p>

          <div className="p-6 rounded-3xl mb-8 max-w-md" style={{ background: 'rgba(255,255,255,0.9)', border: '3px solid #10B981' }}>
            <p className="text-lg text-center leading-relaxed" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
              {currentScenario.scenario}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
            {currentScenario.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="p-4 rounded-2xl transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}
              >
                <span className="text-base" style={{ color: '#15113C', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  {option}
                </span>
              </button>
            ))}
          </div>
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

        <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
          <div className="mb-6 p-6 rounded-full" style={{ background: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
            <span className="text-7xl">{currentScenario.emoji}</span>
          </div>

          <h2 className="text-3xl mb-2 text-center" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
            {isCorrect ? "You identified it!" : "Common emotion"}
          </h2>

          <p className="text-lg mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>
            {currentScenario.emotion}
          </p>

          <div className="p-5 rounded-2xl max-w-md mb-8" style={{ background: 'rgba(255,255,255,0.8)' }}>
            <div className="flex items-start gap-2 mb-2">
              <Heart className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#10B981' }} />
              <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#15113C' }}>
                Coping Strategy:
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
              {currentScenario.copingStrategy}
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="w-full max-w-sm py-3 rounded-full transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return null;
}

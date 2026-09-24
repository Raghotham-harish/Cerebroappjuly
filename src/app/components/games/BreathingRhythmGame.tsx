import { useState, useEffect } from "react";
import { Trophy, RotateCcw, X } from "lucide-react";

interface BreathingRhythmGameProps {
  onClose: () => void;
  onComplete: (breathCount: number) => void;
}

type BreathPhase = "inhale" | "hold1" | "exhale" | "hold2";

export function BreathingRhythmGame({ onClose, onComplete }: BreathingRhythmGameProps) {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [breathCount, setBreathCount] = useState(0);
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [progress, setProgress] = useState(0);

  const GOAL_BREATHS = 10;

  // Timing for each phase (in seconds)
  const PHASE_DURATION = {
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4
  };

  const PHASE_TEXT = {
    inhale: "Breathe In",
    hold1: "Hold",
    exhale: "Breathe Out",
    hold2: "Hold"
  };

  const NEXT_PHASE: Record<BreathPhase, BreathPhase> = {
    inhale: "hold1",
    hold1: "exhale",
    exhale: "hold2",
    hold2: "inhale"
  };

  useEffect(() => {
    if (gameState !== "playing") return;

    const duration = PHASE_DURATION[phase] * 1000;
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / steps) * 100;
      setProgress(newProgress);

      if (currentStep >= steps) {
        // Move to next phase
        const nextPhase = NEXT_PHASE[phase];
        setPhase(nextPhase);
        setProgress(0);

        // Increment breath count when completing exhale phase
        if (phase === "hold2") {
          const newCount = breathCount + 1;
          setBreathCount(newCount);

          if (newCount >= GOAL_BREATHS) {
            setGameState("finished");
          }
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [phase, gameState, breathCount]);

  const handleRestart = () => {
    setBreathCount(0);
    setPhase("inhale");
    setProgress(0);
    setGameState("playing");
  };

  // Calculate circle size based on phase
  const getCircleScale = () => {
    if (phase === "inhale") {
      return 0.5 + (progress / 100) * 0.5; // 50% to 100%
    } else if (phase === "exhale") {
      return 1 - (progress / 100) * 0.5; // 100% to 50%
    } else {
      return phase === "hold1" ? 1 : 0.5; // Hold at current size
    }
  };

  const circleScale = getCircleScale();

  // Get color based on phase
  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return {
          gradient: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.4) 100%)',
          shadow: '0 0 60px rgba(59, 130, 246, 0.5)'
        };
      case "hold1":
      case "hold2":
        return {
          gradient: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(139, 92, 246, 0.4) 100%)',
          shadow: '0 0 60px rgba(139, 92, 246, 0.5)'
        };
      case "exhale":
        return {
          gradient: 'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, rgba(236, 72, 153, 0.4) 100%)',
          shadow: '0 0 60px rgba(236, 72, 153, 0.5)'
        };
    }
  };

  const phaseColor = getPhaseColor();

  if (gameState === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
          <h2 className="text-lg" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
            Breathing Rhythm
          </h2>
          <div className="w-10" />
        </div>

        {/* Results */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' }}>
            <Trophy className="w-12 h-12" style={{ color: 'white' }} />
          </div>

          <h1 className="text-4xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
            {GOAL_BREATHS} Breaths
          </h1>
          <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
            Completed successfully
          </p>

          <div className="p-6 rounded-3xl mb-8 text-center max-w-sm" style={{ background: 'rgba(255,255,255,0.8)', border: '2px solid #D1FAE5' }}>
            <p className="text-sm mb-3" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280', lineHeight: 1.6 }}>
              Your breath is now more calm and centered. You've activated your parasympathetic nervous system, reducing stress and anxiety.
            </p>
            <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>
              Well done!
            </p>
          </div>

          {/* Buttons */}
          <div className="w-full max-w-sm space-y-3">
            <button onClick={handleRestart} className="w-full py-3 rounded-full flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              <RotateCcw className="w-5 h-5" />
              Practice Again
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
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Breaths:</span>
          <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#10B981', fontWeight: 600 }}>{breathCount}/{GOAL_BREATHS}</span>
        </div>
      </div>

      {/* Breathing Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Instructions */}
        <p className="text-sm mb-8 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
          Follow the circle with your breath
        </p>

        {/* Animated Circle */}
        <div className="relative w-80 h-80 flex items-center justify-center mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full" style={{ border: '2px dashed rgba(16, 185, 129, 0.3)' }} />

          {/* Breathing circle */}
          <div
            className="rounded-full flex items-center justify-center transition-all"
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${circleScale})`,
              background: phaseColor.gradient,
              boxShadow: phaseColor.shadow,
              transitionDuration: '100ms',
              transitionTimingFunction: 'linear'
            }}
          >
            <div className="text-center">
              <p className="text-3xl mb-2" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: 'white' }}>
                {PHASE_TEXT[phase]}
              </p>
              <p className="text-xl" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>
                {Math.ceil(PHASE_DURATION[phase] - (progress / 100) * PHASE_DURATION[phase])}s
              </p>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {[...Array(GOAL_BREATHS)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: i < breathCount ? '#10B981' : 'rgba(16, 185, 129, 0.3)'
              }}
            />
          ))}
        </div>

        {/* Tip */}
        <div className="mt-8 p-4 rounded-2xl max-w-sm" style={{ background: 'rgba(255,255,255,0.6)' }}>
          <p className="text-xs text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280', lineHeight: 1.5 }}>
            <strong>Tip:</strong> For deeper practice, try alternate nostril breathing (Nadi Shodhana) - close right nostril, inhale left; close left, exhale right; repeat.
          </p>
        </div>
      </div>
    </div>
  );
}

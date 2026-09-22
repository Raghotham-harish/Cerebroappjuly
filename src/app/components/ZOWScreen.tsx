import { useState } from "react";
import { AnimatedLogo } from "./AnimatedLogo";
import { ZOWCapture } from "./ZOWCapture";
import { ZOWLeaderboard } from "./ZOWLeaderboard";
import { ZOWHistory } from "./ZOWHistory";
import { DailyIntention } from "./DailyIntention";

interface ZOWScreenProps {
  userName: string;
  userIntents?: string[];
  onComplete: () => void;
}

export function ZOWScreen({ userName, userIntents = [], onComplete }: ZOWScreenProps) {
  const [currentStep, setCurrentStep] = useState<'capture' | 'leaderboard' | 'history' | 'intention'>('capture');
  const [currentZER, setCurrentZER] = useState<number>(0);
  const [currentTrigger, setCurrentTrigger] = useState<string | undefined>(undefined);

  const handleZERComplete = (zowLevel: number, trigger?: string) => {
    setCurrentZER(zowLevel);
    setCurrentTrigger(trigger);
    setCurrentStep('leaderboard');
  };

  const handleLeaderboardContinue = () => {
    setCurrentStep('intention');
  };

  const handleViewHistory = () => {
    setCurrentStep('history');
  };

  const handleBackFromHistory = () => {
    setCurrentStep('leaderboard');
  };

  const handleIntentionComplete = (intention: string) => {
    console.log('Daily intention:', intention);
    onComplete();
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: 'white'
      }}
    >
      {/* Logo Header - hide on history screen */}
      {currentStep !== 'history' && (
        <div className="pt-8 pb-4 flex justify-center px-4">
          <AnimatedLogo size={48} animate={false} />
        </div>
      )}

      {/* Content */}
      {currentStep === 'capture' ? (
        <ZOWCapture userName={userName} onComplete={handleZERComplete} />
      ) : currentStep === 'leaderboard' ? (
        <ZOWLeaderboard currentZER={currentZER} trigger={currentTrigger} onContinue={handleLeaderboardContinue} onViewHistory={handleViewHistory} />
      ) : currentStep === 'history' ? (
        <ZOWHistory onBack={handleBackFromHistory} />
      ) : (
        <DailyIntention userName={userName} userIntents={userIntents} onComplete={handleIntentionComplete} />
      )}
    </div>
  );
}
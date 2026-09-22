import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { UserInfoCapture } from "./components/UserInfoCapture";
import { OracleSetup, OracleConfig } from "./components/OracleSetup";
import { CompanySelection } from "./components/CompanySelection";
import { DailyIntentCapture } from "./components/DailyIntentCapture";
import { PersonalLeaderboard } from "./components/PersonalLeaderboard";
import { ProgressionSpiral } from "./components/ProgressionSpiral";
import { RewardsAndBadges } from "./components/RewardsAndBadges";
import { LifeSatisfactionScale } from "./components/LifeSatisfactionScale";
import { ZOWScreen } from "./components/ZOWScreen";
import { HomeScreen } from "./components/HomeScreen";
import { ConversationalChat } from "./components/ConversationalChat";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { BurnoutAssessment } from "./components/BurnoutAssessment";
import { BurnoutResult } from "./components/BurnoutResult";
import { CoachBooking } from "./components/CoachBooking";
import { SplashScreen } from "./components/SplashScreen";
import { PsychologicalProfileFlow, ProfileData } from "./components/PsychologicalProfileFlow";
import { ConsentModal } from "./components/ConsentModal";
import { PointsProvider, usePoints } from "./contexts/PointsContext";
import { BurnoutProvider } from "./contexts/BurnoutContext";

type AppState = "splash" | "login" | "consent1" | "consent2" | "userInfo" | "oracleSetup" | "companySelection" | "psychologicalProfile" | "dailyIntent" | "personalLeaderboard" | "progression" | "rewards" | "lifeSatisfaction" | "zow" | "home" | "chat" | "burnoutAssessment" | "burnoutResult" | "coachBooking";

interface UserInfo {
  name: string;
  gender: string;
  company?: string;
  companyId?: string;
  companyEmail?: string;
  psychologicalProfile?: ProfileData;
}

function AppContent() {
  const [appState, setAppState] = useState<AppState>("splash");
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", gender: "" });
  const [oracleConfig, setOracleConfig] = useState<OracleConfig>({ name: "", avatarUrl: "", voiceType: "" });
  const [lifeSatisfactionScores, setLifeSatisfactionScores] = useState<number[]>([]);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [completedActivity, setCompletedActivity] = useState<'zer' | 'breathing' | 'gratitude' | 'tool' | null>(null);

  const { addIntent, intents, pillarProgress, totalPoints, currentStreak, updateStreak } = usePoints();

  const handleSplashComplete = () => setAppState("login");
  const handleLogin = () => setAppState("consent1");
  const handleConsent1 = () => setAppState("consent2");
  const handleConsent2 = () => setAppState("userInfo");
  const handleUserInfoComplete = (info: UserInfo) => { setUserInfo(info); setAppState("oracleSetup"); };
  const handleOracleSetupComplete = (config: OracleConfig) => { setOracleConfig(config); setAppState("companySelection"); };
  const handleCompanySelectionComplete = (companyName: string, companyEmail: string, companyId?: string) => {
    setUserInfo(prev => ({ ...prev, company: companyName, companyEmail, companyId }));
    setAppState("psychologicalProfile");
  };
  const handlePsychologicalProfileComplete = (profile: ProfileData) => {
    setUserInfo(prev => ({ ...prev, psychologicalProfile: profile }));
    setAppState("dailyIntent");
  };
  const handlePsychologicalProfileSkip = () => setAppState("dailyIntent");
  const handleDailyIntentComplete = (dailyIntents: any[]) => {
    dailyIntents.forEach(intent => addIntent(intent));
    setAppState("personalLeaderboard");
  };
  const handlePersonalLeaderboardStart = () => { updateStreak(); setAppState("chat"); };
  const handleCloseProgression = () => setAppState("chat");
  const handleCloseRewards = () => setAppState("chat");
  const handleLifeSatisfactionComplete = (scores: number[]) => { setLifeSatisfactionScores(scores); setAppState("zow"); };
  const handleZERComplete = () => { setCompletedActivity('zer'); setAppState("chat"); };
  const handleStartChat = (_mode: string) => setAppState("chat");
  const handleCloseChat = () => setAppState("home");
  const handleBurnoutAssessmentComplete = () => setAppState("burnoutResult");
  const handleBurnoutResultContinue = () => setAppState("chat");
  const handleViewBurnoutAnalytics = () => setAppState("chat");
  const handleBookCoach = () => setAppState("coachBooking");
  const handleCoachBookingComplete = () => setAppState("chat");

  return (
    <>
      {appState === "splash" && <SplashScreen onComplete={handleSplashComplete} />}
      {appState === "login" && <LoginScreen onLogin={handleLogin} />}
      {appState === "consent1" && <ConsentModal variant="disclaimer" onAccept={handleConsent1} />}
      {appState === "consent2" && <ConsentModal variant="privacy" onAccept={handleConsent2} />}
      {appState === "userInfo" && <UserInfoCapture onComplete={handleUserInfoComplete} permissionGranted={micPermissionGranted} onPermissionGranted={setMicPermissionGranted} />}
      {appState === "oracleSetup" && <OracleSetup userName={userInfo.name} onComplete={handleOracleSetupComplete} permissionGranted={micPermissionGranted} onPermissionGranted={setMicPermissionGranted} />}
      {appState === "companySelection" && <CompanySelection userName={userInfo.name} onComplete={handleCompanySelectionComplete} />}
      {appState === "psychologicalProfile" && <PsychologicalProfileFlow onComplete={handlePsychologicalProfileComplete} onClose={handlePsychologicalProfileSkip} />}
      {appState === "dailyIntent" && <DailyIntentCapture userName={userInfo.name} onComplete={handleDailyIntentComplete} />}
      {appState === "personalLeaderboard" && <PersonalLeaderboard userName={userInfo.name} intents={intents} onGetStarted={handlePersonalLeaderboardStart} />}
      {appState === "progression" && <ProgressionSpiral userName={userInfo.name} progress={pillarProgress} totalPoints={totalPoints} onClose={handleCloseProgression} />}
      {appState === "rewards" && <RewardsAndBadges userName={userInfo.name} totalPoints={totalPoints} currentStreak={currentStreak} onClose={handleCloseRewards} />}
      {appState === "lifeSatisfaction" && <LifeSatisfactionScale userName={userInfo.name} onComplete={handleLifeSatisfactionComplete} />}
      {appState === "zow" && <ZOWScreen userName={userInfo.name} userIntents={intents.map(i => i.intent)} onComplete={handleZERComplete} />}
      {appState === "home" && <HomeScreen userName={userInfo.name} onStartChat={handleStartChat} />}
      {appState === "chat" && <ConversationalChat oracleName={oracleConfig.name} userName={userInfo.name} onClose={handleCloseChat} completedActivity={completedActivity} />}
      {appState === "burnoutAssessment" && <BurnoutAssessment onComplete={handleBurnoutAssessmentComplete} />}
      {appState === "burnoutResult" && <BurnoutResult onContinue={handleBurnoutResultContinue} onViewAnalytics={handleViewBurnoutAnalytics} onBookCoach={handleBookCoach} />}
      {appState === "coachBooking" && <CoachBooking onComplete={handleCoachBookingComplete} />}
      <AnimatedBackground />
    </>
  );
}

function App() {
  return (
    <BurnoutProvider>
      <PointsProvider>
        <AppContent />
      </PointsProvider>
    </BurnoutProvider>
  );
}

export default App;

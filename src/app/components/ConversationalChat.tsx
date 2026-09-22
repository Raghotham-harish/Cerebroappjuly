import { useState, useRef, useEffect } from "react";
import { Mic, Volume2, VolumeX, ArrowUp, Heart, BookOpen, Wind, Award, Lightbulb, Bell, ThumbsUp, ThumbsDown, Scan, PenLine, BookHeart, Sparkles, Eye, Layers, ShieldCheck } from "lucide-react";
import { VoiceWaveOrb } from "./VoiceWaveOrb";
import { BottomNav } from "./BottomNav";
import { AnimatedLogo } from "./AnimatedLogo";
import { InsightsScreen } from "./InsightsScreen";
import { ToolsScreen } from "./ToolsScreen";
import { EnhancedHomeScreen } from "./EnhancedHomeScreen";
import { ProfileScreen } from "./ProfileScreen";
import { NotificationsScreen } from "./NotificationsScreen";
import { BreathingExercise } from "./BreathingExercise";
import { GratitudeExercise } from "./GratitudeExercise";
import { InsightReelScreen } from "./InsightReelScreen";
import { ZOWScreen } from "./ZOWScreen";
import { BurnoutAnalytics } from "./BurnoutAnalytics";
import { GamesHub } from "./GamesHub";
import { ColorTapGame } from "./games/ColorTapGame";
import { BreathingRhythmGame } from "./games/BreathingRhythmGame";
import { SoundHunterGame } from "./games/SoundHunterGame";
import { FreezeSwitchGame } from "./games/FreezeSwitchGame";
import { DistractionDodgeGame } from "./games/DistractionDodgeGame";
import { PatternRecallGame } from "./games/PatternRecallGame";
import { ObjectTrayGame } from "./games/ObjectTrayGame";
import { StoryBuilderGame } from "./games/StoryBuilderGame";
import { PathMemoryGame } from "./games/PathMemoryGame";
import { EmotionMatchGame } from "./games/EmotionMatchGame";
import { StormBalanceGame } from "./games/StormBalanceGame";
import { ThoughtSortGame } from "./games/ThoughtSortGame";
import { GrowthGardenGame } from "./games/GrowthGardenGame";
import { EmotionCompassGame } from "./games/EmotionCompassGame";
import { RuleSwitchGame } from "./games/RuleSwitchGame";
import { ShapeShiftPuzzleGame } from "./games/ShapeShiftPuzzleGame";
import { MultiTaskRelayGame } from "./games/MultiTaskRelayGame";
import { ZenSandGame } from "./games/ZenSandGame";
import { CloudDriftGame } from "./games/CloudDriftGame";
import { usePoints } from "../contexts/PointsContext";
import { BreathLoopsScreen } from "./tools/BreathLoopsScreen";
import { DisidentificationScreen } from "./tools/DisidentificationScreen";
import { GuidedImageryScreen } from "./tools/GuidedImageryScreen";
import { GratitudeJournalScreen } from "./tools/GratitudeJournalScreen";
import { WillTrainingScreen } from "./tools/WillTrainingScreen";
import { RitualBuilderScreen } from "./tools/RitualBuilderScreen";
import { SubpersonalityWorkScreen } from "./tools/SubpersonalityWorkScreen";
import { BodyScanScreen } from "./tools/BodyScanScreen";
import { ZERScreen } from "./tools/ZERScreen";
import { AffirmationsScreen } from "./tools/AffirmationsScreen";
import { CrisisGroundingScreen } from "./tools/CrisisGroundingScreen";
import { SleepRitualScreen } from "./tools/SleepRitualScreen";
import { GratitudeAssessmentScreen } from "./tools/GratitudeAssessmentScreen";
import { AnxietyAssessmentScreen } from "./tools/AnxietyAssessmentScreen";
import { TraumaAssessmentScreen } from "./tools/TraumaAssessmentScreen";
import { AssessmentHubScreen } from "./AssessmentHubScreen";
import { BurnoutBATScreen } from "./tools/BurnoutBATScreen";
import { GAD7Screen } from "./tools/GAD7Screen";
import { DASSScreen } from "./tools/DASSScreen";
import { GRATScreen } from "./tools/GRATScreen";
import { OLBIScreen } from "./tools/OLBIScreen";
import { CBIScreen } from "./tools/CBIScreen";
import { ACEScreen } from "./tools/ACEScreen";
import { SIBOQScreen } from "./tools/SIBOQScreen";
import { RBSTScreen } from "./tools/RBSTScreen";
import { AboutYourHealthScreen } from "./tools/AboutYourHealthScreen";

interface ConversationalChatProps {
  oracleName: string;
  userName: string;
  onClose: () => void;
  completedActivity?: 'zer' | 'breathing' | 'gratitude' | 'tool' | null;
}

type ContextualCard = {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaAction?: string; // tool id or 'reflect'
  bg: string;
  border: string;
  btnColor: string;
};

type MessageType =
  | { type: 'oracle'; text: string }
  | { type: 'user'; text: string; hasAudio?: boolean }
  | { type: 'action-card'; activity: 'breathing' | 'gratitude' | 'journaling'; title: string; description: string; completed?: boolean }
  | { type: 'insight-card'; title: string; description: string; highlight: string }
  | { type: 'did-you-know'; fact: string; imageUrl?: string; videoUrl?: string }
  | { type: 'zow-prompt'; }
  | { type: 'personalized-question'; text: string }
  | { type: 'assessment-card'; title: string; description: string }
  | { type: 'acknowledgement'; text: string; emotion: string }
  | { type: 'contextual-actions'; intro: string; cards: ContextualCard[] };

// ── Contextual card sets ──────────────────────────────────────────────────────
const CONTEXTUAL_SETS: Record<string, { intro: string; cards: ContextualCard[] }> = {
  zer: {
    intro: "Thank you for checking in. Here's what might support you right now.",
    cards: [
      {
        id: 'zer-body',
        icon: Scan, iconBg: '#D1FAE5',
        title: 'Quick Body Scan',
        description: 'Ground yourself in 3 minutes by scanning from head to feet.',
        ctaLabel: 'Start body scan',
        ctaAction: 'bodyscan',
        bg: '#F5F3FF', border: '#DDD6FE', btnColor: '#8B5CF6',
      },
      {
        id: 'zer-breath',
        icon: Wind, iconBg: '#CFFAFE',
        title: 'Short Breath Loop',
        description: 'A 2-minute breathing cycle to settle your nervous system.',
        ctaLabel: 'Try breath loop',
        ctaAction: 'breath',
        bg: '#F5F3FF', border: '#DDD6FE', btnColor: '#8B5CF6',
      },
      {
        id: 'zer-reflect',
        icon: PenLine, iconBg: '#EDE9FE',
        title: 'What needs your attention right now?',
        description: 'Notice what is present — no need to fix it. Just name it.',
        ctaLabel: 'Open journal',
        ctaAction: 'gratitude',
        bg: '#F5F3FF', border: '#DDD6FE', btnColor: '#8B5CF6',
      },
    ],
  },
  breathing: {
    intro: "Well done — your nervous system appreciates that. What next?",
    cards: [
      {
        id: 'breath-journal',
        icon: BookHeart, iconBg: '#BFDBFE',
        title: 'Capture this moment',
        description: 'Write one thing you\'re grateful for right now.',
        ctaLabel: 'Open gratitude journal',
        ctaAction: 'gratitude',
        bg: '#F5F3FF', border: '#DDD6FE', btnColor: '#8B5CF6',
      },
      {
        id: 'breath-body',
        icon: Scan, iconBg: '#D1FAE5',
        title: 'Notice your body',
        description: 'A 3-minute body scan to complete the regulation cycle.',
        ctaLabel: 'Start body scan',
        ctaAction: 'bodyscan',
        bg: '#F5F3FF', border: '#DDD6FE', btnColor: '#8B5CF6',
      },
    ],
  },
  gratitude: {
    intro: "Gratitude shifts the mind toward abundance. Keep the momentum.",
    cards: [
      {
        id: 'grat-affirm',
        icon: Sparkles, iconBg: '#FEF3C7',
        title: 'Set an affirmation',
        description: 'Turn your gratitude into a powerful personal affirmation.',
        ctaLabel: 'Open affirmations',
        ctaAction: 'affirmations',
        bg: '#F5F3FF', border: '#DDD6FE', btnColor: '#8B5CF6',
      },
      {
        id: 'grat-surround',
        icon: Eye, iconBg: '#D1FAE5',
        title: 'Two-minute focus reset',
        description: 'Look around — what in your surroundings can hold your attention for 2 minutes?',
        bg: '#F5F3FF', border: '#DDD6FE', btnColor: '#8B5CF6',
      },
    ],
  },
  tool: {
    intro: "Great work completing that. Would any of these help you go deeper?",
    cards: [
      {
        id: 'tool-zer',
        icon: Layers, iconBg: '#FFE4E6',
        title: 'Check your ZER zone',
        description: 'Notice where you are emotionally after this activity.',
        ctaLabel: 'Open ZER check-in',
        ctaAction: 'zer',
        bg: '#F5F3FF', border: '#DDD6FE', btnColor: '#8B5CF6',
      },
      {
        id: 'tool-breath',
        icon: Wind, iconBg: '#CFFAFE',
        title: 'Breath loop',
        description: 'A quick breathing cycle to anchor the work you just did.',
        ctaLabel: 'Start breathing',
        ctaAction: 'breath',
        bg: '#F5F3FF', border: '#DDD6FE', btnColor: '#8B5CF6',
      },
    ],
  },
};

export function ConversationalChat({ oracleName, userName, completedActivity }: ConversationalChatProps) {
  const [isListening, setIsListening] = useState(false); // Start as false, user clicks to start
  const [textValue, setTextValue] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([
    { type: 'oracle', text: `Hey ${userName}, what do you wish to share?` }
  ]);
  const [activeTab, setActiveTab] = useState<"activities" | "chat" | "insights" | "tools" | "profile">("chat");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifUnreadCount, setNotifUnreadCount] = useState(3);
  const [micEnabled, setMicEnabled] = useState(true);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [activeActivity, setActiveActivity] = useState<'breathing' | 'gratitude' | 'zow' | null>(null);
  const [showingInsightReel, setShowingInsightReel] = useState<{
    type: 'insight' | 'did-you-know';
    title?: string;
    description?: string;
    highlight?: string;
    fact?: string;
    backgroundMedia?: string;
  } | null>(null);
  const [pointsNotification, setPointsNotification] = useState<{ points: number; category: string } | null>(null);
  const [showBurnoutAnalytics, setShowBurnoutAnalytics] = useState(false);
  const [showGamesHub, setShowGamesHub] = useState(false);
  const [showAssessmentHub, setShowAssessmentHub] = useState(false);
  const [showHealthScreens, setShowHealthScreens] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [cardFeedback, setCardFeedback] = useState<Record<number, 'up' | 'down'>>({});
  const [thumbAnimKey, setThumbAnimKey] = useState<Record<string, number>>({});
  const handleTabChange = (tab: typeof activeTab) => { setActiveTool(null); setActiveTab(tab); };

  // Called from assessment result screens to pre-seed an oracle conversation
  const handleOpenChatWithPrompt = (prompt: string) => {
    setActiveTool(null);
    setShowAssessmentHub(false);
    setActiveTab("chat");
    setTimeout(() => {
      handleUserMessage(prompt, false);
    }, 400);
  };

  // Inject contextual follow-up cards when returning from a completed activity
  useEffect(() => {
    if (!completedActivity) return;
    const set = CONTEXTUAL_SETS[completedActivity];
    if (!set) return;
    setMessages(prev => [
      ...prev,
      { type: 'contextual-actions', intro: set.intro, cards: set.cards } as MessageType,
    ]);
  }, [completedActivity]);

  // Points tracking context
  const { detectIntentFromText, addActivity, streakMultiplier } = usePoints();
  const [pendingPersonalizedQuestion, setPendingPersonalizedQuestion] = useState<string | null>(null);
  const [hasTriggeredDemo, setHasTriggeredDemo] = useState(false); // Track if demo has run
  const [showQuickReplies, setShowQuickReplies] = useState(true); // Show quick reply chips initially
  const [awaitingJobDurationAnswer, setAwaitingJobDurationAnswer] = useState(false); // Track if we're waiting for job duration answer
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Text-to-speech function
  const speak = (text: string) => {
    if (!speakerEnabled || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    
    // Try to use a pleasant female voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Karen') ||
      v.name.includes('Google US English Female')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Read new messages aloud

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.type === 'oracle') {
        speak(lastMessage.text);
      } else if (lastMessage.type === 'action-card') {
        speak(lastMessage.title);
      } else if (lastMessage.type === 'personalized-question') {
        speak(lastMessage.text);
      } else if (lastMessage.type === 'insight-card') {
        speak(lastMessage.title);
      } else if (lastMessage.type === 'acknowledgement') {
        speak(lastMessage.text);
      }
    }
  }, [messages, speakerEnabled]);

  const handleMicClick = () => {
    if (!micEnabled) return;
    
    if (isListening) {
      // Stop listening
      setIsListening(false);
    } else {
      // Start listening
      setIsListening(true);
      
      // Simulate voice input after 2.5 seconds
      setTimeout(() => {
        setIsListening(false);
        handleUserMessage("I had a challenging day today...", true);
      }, 2500);
    }
  };

  const handleUserMessage = (text: string, hasAudio: boolean = false) => {
    setMessages(prev => [...prev, { type: 'user', text, hasAudio }]);

    // SAMPLE INTENT DETECTION - Detect if message relates to user's daily intentions
    const detection = detectIntentFromText(text);
    if (detection.detected && detection.intentId) {
      // Award points for talking about their intent
      addActivity(detection.intentId, {
        type: 'chat',
        description: `Discussed "${text.substring(0, 50)}..."`
      });

      // Show points notification
      const pointsEarned = 5 * streakMultiplier;
      setPointsNotification({
        points: pointsEarned,
        category: detection.category || 'general'
      });

      // Hide notification after 3 seconds
      setTimeout(() => {
        setPointsNotification(null);
      }, 3000);
    }

    // Check if this is answer to job duration question
    if (awaitingJobDurationAnswer) {
      setAwaitingJobDurationAnswer(false);
      
      // Oracle acknowledges answer
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, 
            { type: 'oracle', text: "That's great! Now let me help you track your wellness journey." }
          ]);
          
          // Show ZER prompt after acknowledgement
          setTimeout(() => {
            setMessages(prev => [...prev, { type: 'zow-prompt' }]);
          }, 1000);
        }, 1500);
      }, 500);
      return;
    }
    
    // Oracle responds with empathy
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        
        // Empathetic acknowledgement
        setMessages(prev => [...prev, 
          { type: 'oracle', text: "I hear you, and I'm here with you. Challenging days can feel heavy. Let's take a moment together to center yourself." }
        ]);
        
        // Show action card after a brief pause
        setTimeout(() => {
          setMessages(prev => [...prev, 
            { 
              type: 'action-card', 
              activity: 'breathing',
              title: 'Take 3 Deep Breaths',
              description: 'A quick breathing exercise to help you find calm'
            }
          ]);
        }, 1000);
      }, 2000);
    }, 500);
  };

  const handleActivityComplete = (activity: string) => {
    setActiveActivity(null);
    setIsListening(true); // Re-enable voice listening when returning to chat
    
    // Mark the action card as completed
    setMessages(prev => prev.map(msg =>
      msg.type === 'action-card' && msg.activity === activity
        ? { ...msg, completed: true }
        : msg
    ));

    // Inject contextual follow-up cards based on completed activity
    const setKey = activity === 'breathing' ? 'breathing' : activity === 'gratitude' ? 'gratitude' : 'tool';
    const cSet = CONTEXTUAL_SETS[setKey];
    if (cSet) {
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'contextual-actions', intro: cSet.intro, cards: cSet.cards } as MessageType]);
      }, 800);
    }
    
    // Show insight reel first
    setTimeout(() => {
      setShowingInsightReel({
        type: 'insight',
        title: 'Your Personalized Insight',
        description: 'I noticed your breath was shallow at first, then deepened. This tells me your body was holding tension. You just gave yourself permission to release it.',
        highlight: 'Self-compassion in action'
      });
    }, 500);
  };

  const handleInsightReelComplete = () => {
    const currentReel = showingInsightReel;
    setShowingInsightReel(null);
    
    // If we just showed the insight, now show did-you-know
    if (currentReel?.type === 'insight') {
      setTimeout(() => {
        setShowingInsightReel({
          type: 'did-you-know',
          fact: 'Deep breathing activates your parasympathetic nervous system, which naturally calms your stress response. Even 3 breaths can shift your state.'
        });
      }, 500);
    } else if (currentReel?.type === 'did-you-know') {
      // After did-you-know, add personalized question to chat and trigger auto response
      setTimeout(() => {
        setMessages(prev => [...prev,
          { type: 'personalized-question', text: "By the way, I'd love to know more about you. What do you do for work?" }
        ]);
        
        // Start listening animation after question appears (1 second after question)
        setTimeout(() => {
          setIsListening(true);
          
          // Simulate voice capture after 2.5 seconds of listening
          setTimeout(() => {
            setIsListening(false);
            setMessages(prev => [...prev, 
              { type: 'user', text: "I'm a product designer at a tech startup", hasAudio: true }
            ]);
            
            // Oracle responds to user's answer
            setTimeout(() => {
              setIsTyping(true);
              
              setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev,
                  { type: 'oracle', text: "That's wonderful! Product design requires so much creativity and problem-solving. How long have you been in this role?" }
                ]);
                setAwaitingJobDurationAnswer(true); // Set flag to wait for user's answer
              }, 2000);
            }, 500);
          }, 2500);
        }, 1000);
      }, 500);
    }
  };

  const handleTextSubmit = () => {
    if (textValue.trim()) {
      handleUserMessage(textValue.trim(), false);
      setTextValue('');
    }
  };

  const renderChatView = () => (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: 'transparent' }}
    >
      <style>{`
        @keyframes ceThumbUp {
          0%   { transform: scale(1) rotate(0deg); }
          25%  { transform: scale(1.6) rotate(-15deg); }
          55%  { transform: scale(1.25) rotate(8deg); }
          80%  { transform: scale(1.1) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes ceThumbDown {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20%  { transform: translateX(-4px) rotate(-8deg); }
          40%  { transform: translateX(4px) rotate(8deg); }
          60%  { transform: translateX(-3px) rotate(-4deg); }
          80%  { transform: translateX(2px) rotate(2deg); }
        }
      `}</style>
      {/* Top Bar - Sticky */}
      <div 
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b"
        style={{ 
          background: 'linear-gradient(135deg, rgba(250, 245, 255, 0.95) 0%, rgba(252, 231, 243, 0.9) 50%, rgba(235, 248, 255, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(229, 231, 235, 0.5)'
        }}
      >
        {/* Oracle Name & Status */}
        <div className="flex items-center gap-2">
          <AnimatedLogo size={28} animate={isListening} />
          <div>
            <h3 
              className="text-sm"
              style={{ 
                fontFamily: 'Lora, serif',
                fontWeight: 500,
                color: '#15113C'
              }}
            >
              {oracleName}
            </h3>
            <p 
              className="text-xs"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                color: isListening ? '#10B981' : '#6B7280'
              }}
            >
              {isListening ? 'Listening' : 'Ready'}
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex gap-2 items-center">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(true); setActiveTab("profile"); setNotifUnreadCount(0); }}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1.5px solid rgba(196,181,253,0.5)",
              }}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" style={{ color: "#15113C", strokeWidth: 1.75 }} />
            </button>
            {notifUnreadCount > 0 && (
              <div
                className="absolute -top-1 -right-1 flex items-center justify-center rounded-full"
                style={{
                  minWidth: 16,
                  height: 16,
                  background: "#8B5CF6",
                  fontFamily: "Inter",
                  fontWeight: 700,
                  fontSize: "9px",
                  color: "white",
                  paddingLeft: 3,
                  paddingRight: 3,
                }}
              >
                {notifUnreadCount}
              </div>
            )}
          </div>

          <button
            onClick={() => setSpeakerEnabled(!speakerEnabled)}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: speakerEnabled ? 'rgba(255,255,255,0.9)' : 'rgba(243,244,246,0.8)',
              border: `1.5px solid ${speakerEnabled ? '#C4B5FD' : 'rgba(229,231,235,0.8)'}`
            }}
          >
            {speakerEnabled ? (
              <Volume2 className="w-4 h-4" style={{ color: '#8B5CF6', strokeWidth: 1.75 }} />
            ) : (
              <VolumeX className="w-4 h-4" style={{ color: '#9CA3AF', strokeWidth: 1.75 }} />
            )}
          </button>
          <button
            onClick={() => setMicEnabled(!micEnabled)}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: micEnabled ? 'rgba(255,255,255,0.9)' : 'rgba(243,244,246,0.8)',
              border: `1.5px solid ${micEnabled ? '#C4B5FD' : 'rgba(229,231,235,0.8)'}`
            }}
          >
            <Mic
              className="w-4 h-4"
              style={{ color: micEnabled ? '#8B5CF6' : '#9CA3AF', strokeWidth: 1.75 }}
            />
          </button>
        </div>
      </div>

      {/* Points Notification Toast */}
      {pointsNotification && (
        <div
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce"
          style={{
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          <div
            className="px-6 py-3 rounded-full flex items-center gap-3 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
              border: '2px solid white'
            }}
          >
            <Award className="w-5 h-5" style={{ color: 'white' }} />
            <span
              className="text-base"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                color: 'white'
              }}
            >
              +{pointsNotification.points} points!
            </span>
            {streakMultiplier > 1 && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  color: 'white'
                }}
              >
                {streakMultiplier}x streak
              </span>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-4 pt-4"
        style={{
          background: '#FAFAFA',
          paddingBottom: 'calc(200px + 5rem)' // Space for sticky bottom card
        }}
      >
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.type === 'oracle' && (
                <div className="text-center py-6 px-4">
                  <h2 
                    className="text-xl mb-2 max-w-md mx-auto"
                    style={{ 
                      fontFamily: 'Lora, serif',
                      fontWeight: 500,
                      color: '#15113C',
                      lineHeight: 1.4
                    }}
                  >
                    {msg.text}
                  </h2>

                  {/* Quick Reply Chips - only show after first oracle message */}
                  {i === 0 && showQuickReplies && (
                    <div className="mt-4 space-y-2 max-w-md mx-auto px-2">
                      {[
                        "I'm feeling stressed about work",
                        "I had a difficult conversation today",
                        "I want to work on my mindfulness",
                        "I'm struggling with self-doubt",
                        "I need help processing emotions"
                      ].map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setShowQuickReplies(false);
                            handleUserMessage(reply, false);
                          }}
                          className="w-full px-5 py-3.5 rounded-2xl text-left transition-all hover:shadow-sm"
                          style={{
                            background: 'white',
                            border: '2px solid #E5E7EB',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            color: '#15113C'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: '#C4B5FD' }}
                            />
                            {reply}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {msg.type === 'user' && (
                <div className="flex gap-2 justify-end">
                  <div 
                    className="px-4 py-3 rounded-3xl max-w-sm"
                    style={{
                      background: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)',
                      color: 'white'
                    }}
                  >
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {msg.text}
                    </p>
                  </div>
                </div>
              )}

              {msg.type === 'action-card' && (
                msg.completed ? (
                  // Completed state - shown as user response card with muted gradient
                  <div className="flex gap-2 justify-end">
                    <div
                      className="px-5 py-4 rounded-3xl max-w-sm"
                      style={{
                        background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
                        border: '1.5px solid rgba(139,92,246,0.25)'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Wind className="w-5 h-5" style={{ color: '#6D28D9' }} />
                        <p
                          className="text-sm"
                          style={{
                            fontFamily: 'Lora, serif',
                            fontWeight: 500,
                            color: '#15113C'
                          }}
                        >
                          {msg.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg"
                          style={{
                            background: '#DCFCE7',
                            color: '#15803D',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            border: '1px solid #BBF7D0',
                          }}
                        >
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          DONE
                        </div>
                        {/* Thumbs up / down feedback */}
                        <button
                          onClick={() => {
                            setCardFeedback(prev => ({ ...prev, [i]: prev[i] === 'up' ? undefined as any : 'up' }));
                            setThumbAnimKey(prev => ({ ...prev, [`${i}-up`]: (prev[`${i}-up`] || 0) + 1 }));
                          }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                          style={{
                            background: cardFeedback[i] === 'up' ? '#8B5CF6' : 'rgba(255,255,255,0.9)',
                            border: cardFeedback[i] === 'up' ? '1.5px solid #8B5CF6' : '1.5px solid rgba(139,92,246,0.3)',
                          }}
                          title="This helped"
                        >
                          <ThumbsUp
                            key={thumbAnimKey[`${i}-up`] || 0}
                            className="w-3.5 h-3.5"
                            style={{
                              color: cardFeedback[i] === 'up' ? 'white' : '#8B5CF6',
                              strokeWidth: 2,
                              animation: thumbAnimKey[`${i}-up`] ? 'ceThumbUp 0.45s cubic-bezier(0.36,0.07,0.19,0.97) forwards' : undefined,
                            }}
                          />
                        </button>
                        <button
                          onClick={() => {
                            setCardFeedback(prev => ({ ...prev, [i]: prev[i] === 'down' ? undefined as any : 'down' }));
                            setThumbAnimKey(prev => ({ ...prev, [`${i}-down`]: (prev[`${i}-down`] || 0) + 1 }));
                          }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                          style={{
                            background: cardFeedback[i] === 'down' ? '#FEE2E2' : 'rgba(255,255,255,0.9)',
                            border: cardFeedback[i] === 'down' ? '1.5px solid #FCA5A5' : '1.5px solid rgba(239,68,68,0.25)',
                          }}
                          title="This didn't help"
                        >
                          <ThumbsDown
                            key={thumbAnimKey[`${i}-down`] || 0}
                            className="w-3.5 h-3.5"
                            style={{
                              color: cardFeedback[i] === 'down' ? '#EF4444' : '#F87171',
                              strokeWidth: 2,
                              animation: thumbAnimKey[`${i}-down`] ? 'ceThumbDown 0.4s ease forwards' : undefined,
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Pending state - muted gradient action card
                  <div
                    className="p-5 rounded-3xl"
                    style={{
                      background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
                      border: '1.5px solid rgba(139,92,246,0.25)'
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: '#8B5CF6' }}
                      >
                        <Wind className="w-5 h-5" style={{ color: 'white' }} />
                      </div>
                      <div className="flex-1">
                        <h4 
                          className="text-base mb-1"
                          style={{ 
                            fontFamily: 'Lora, serif',
                            fontWeight: 500,
                            color: '#15113C'
                          }}
                        >
                          {msg.title}
                        </h4>
                        <p
                          className="text-sm"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            color: '#6D28D9'
                          }}
                        >
                          {msg.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveActivity(msg.activity)}
                      className="w-full py-3 rounded-full"
                      style={{
                        background: '#8B5CF6',
                        color: 'white',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px'
                      }}
                    >
                      Start Exercise
                    </button>
                  </div>
                )
              )}

              {msg.type === 'insight-card' && (
                <div 
                  className="p-5 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, #EDE9FE 0%, #E0E7FF 100%)',
                    border: '2px solid #C4B5FD'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: '#EDE9FE' }}
                    >
                      <Lightbulb className="w-5 h-5" style={{ color: '#7C3AED', strokeWidth: 1.75 }} />
                    </div>
                    <div className="flex-1">
                      <h4 
                        className="text-base mb-2"
                        style={{ 
                          fontFamily: 'Lora, serif',
                          fontWeight: 500,
                          color: '#8B5CF6'
                        }}
                      >
                        {msg.title}
                      </h4>
                      <p 
                        className="text-sm mb-2 leading-relaxed"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280'
                        }}
                      >
                        {msg.description}
                      </p>
                      <div 
                        className="inline-block px-3 py-1.5 rounded-full"
                        style={{
                          background: 'rgba(139, 92, 246, 0.2)',
                          color: '#8B5CF6',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        {msg.highlight}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {msg.type === 'did-you-know' && (
                <div 
                  className="p-4 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
                    border: '1.5px solid rgba(139,92,246,0.25)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#8B5CF6' }}
                    >
                      <Lightbulb className="w-4 h-4" style={{ color: 'white' }} />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-xs mb-1"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#6D28D9',
                          fontWeight: 600,
                          letterSpacing: '0.05em'
                        }}
                      >
                        DID YOU KNOW?
                      </p>
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#4C1D95'
                        }}
                      >
                        {msg.fact}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {msg.type === 'personalized-question' && (
                <div className="text-center py-6 px-4">
                  <h2 
                    className="text-2xl mb-2 max-w-md mx-auto"
                    style={{ 
                      fontFamily: 'Lora, serif',
                      fontWeight: 500,
                      color: '#15113C',
                      lineHeight: 1.4
                    }}
                  >
                    {msg.text}
                  </h2>
                  <p 
                    className="text-xs"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      color: '#9CA3AF',
                      letterSpacing: '0.05em'
                    }}
                  >
                    TAP THE MIC OR TYPE YOUR ANSWER
                  </p>
                </div>
              )}

              {msg.type === 'assessment-card' && (
                <div 
                  className="p-5 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, #F8FAFC 0%, #E0E7FF 100%)',
                    border: '2px solid #C4B5FD'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: '#8B5CF6' }}
                    >
                      <BookOpen className="w-5 h-5" style={{ color: 'white' }} />
                    </div>
                    <div className="flex-1">
                      <h4 
                        className="text-base mb-2"
                        style={{ 
                          fontFamily: 'Lora, serif',
                          fontWeight: 500,
                          color: '#8B5CF6'
                        }}
                      >
                        {msg.title}
                      </h4>
                      <p 
                        className="text-sm leading-relaxed"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280'
                        }}
                      >
                        {msg.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {msg.type === 'acknowledgement' && (
                <div 
                  className="p-5 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, #F8FAFC 0%, #E0E7FF 100%)',
                    border: '2px solid #C4B5FD'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: '#8B5CF6' }}
                    >
                      <Heart className="w-5 h-5" style={{ color: 'white' }} />
                    </div>
                    <div className="flex-1">
                      <p 
                        className="text-sm leading-relaxed"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280'
                        }}
                      >
                        {msg.text}
                      </p>
                      <div 
                        className="inline-block px-3 py-1.5 rounded-full"
                        style={{
                          background: 'rgba(139, 92, 246, 0.2)',
                          color: '#8B5CF6',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        {msg.emotion}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {msg.type === 'contextual-actions' && (
                <div className="px-1 py-2">
                  {/* Oracle intro line */}
                  <p
                    className="text-center text-sm mb-4 px-2"
                    style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C', lineHeight: 1.6 }}
                  >
                    {msg.intro}
                  </p>
                  {/* Micro-cards */}
                  <div className="space-y-2">
                    {msg.cards.map(card => {
                      const CardIcon = card.icon;
                      return (
                        <div
                          key={card.id}
                          className="p-4 rounded-3xl"
                          style={{ background: card.bg, border: `1.5px solid ${card.border}` }}
                        >
                          <div className="flex items-start gap-3">
                            {/* Tools-style icon holder */}
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                              style={{ background: card.iconBg }}
                            >
                              <CardIcon className="w-5 h-5" style={{ color: '#15113C', strokeWidth: 1.75 }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm mb-1"
                                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#15113C' }}
                              >
                                {card.title}
                              </p>
                              <p
                                className="text-xs mb-3"
                                style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280', lineHeight: 1.55 }}
                              >
                                {card.description}
                              </p>
                              {card.ctaLabel && card.ctaAction && (
                                <button
                                  onClick={() => {
                                    setActiveTool(card.ctaAction!);
                                    setActiveTab('tools');
                                  }}
                                  className="w-full py-2.5 rounded-full text-sm transition-all active:scale-95"
                                  style={{
                                    background: card.btnColor,
                                    color: 'white',
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 600,
                                  }}
                                >
                                  {card.ctaLabel}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {msg.type === 'zow-prompt' && (
                <div 
                  className="p-5 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
                    border: '1.5px solid rgba(139,92,246,0.25)'
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: '#8B5CF6' }}
                    >
                      <Heart className="w-5 h-5" style={{ color: 'white' }} />
                    </div>
                    <div className="flex-1">
                      <h4
                        className="text-base mb-1"
                        style={{
                          fontFamily: 'Lora, serif',
                          fontWeight: 500,
                          color: '#15113C'
                        }}
                      >
                        Check Your Wellness Zone
                      </h4>
                      <p
                        className="text-sm"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#6D28D9'
                        }}
                      >
                        ZER helps track your emotional baseline and progress over time. This important check-in only takes 1 minute.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveActivity('zow')}
                    className="w-full py-3 rounded-full"
                    style={{ 
                      background: '#8B5CF6',
                      color: 'white',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}
                  >
                    Complete ZER Check-in
                  </button>
                </div>
              )}
            </div>
          ))}


          {isTyping && (
            <div className="flex gap-2">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}
              >
                <AnimatedLogo size={14} animate={false} />
              </div>
              <div 
                className="px-4 py-3 rounded-3xl"
                style={{ background: 'white', border: '2px solid #F3F4F6' }}
              >
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#9CA3AF' }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#9CA3AF', animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#9CA3AF', animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sticky Bottom Card - Voice Listening + Text Input */}
      {!activeActivity && !showingInsightReel && (
        <div 
          className="fixed bottom-20 left-0 right-0 z-10 px-4 py-3 border-t"
          style={{ 
            background: 'linear-gradient(135deg, rgba(250, 245, 255, 0.95) 0%, rgba(252, 231, 243, 0.9) 50%, rgba(235, 248, 255, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(229, 231, 235, 0.5)'
          }}
        >
          <div className="max-w-2xl mx-auto">
            {/* Data-safe line */}
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <ShieldCheck className="w-3 h-3" style={{ color: "#9CA3AF", strokeWidth: 1.75 }} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#9CA3AF" }}>
                Private &amp; encrypted &middot; Your data is never shared
              </span>
            </div>

            {/* Voice Wave or Mic Button */}
            <div className="flex items-center justify-center mb-3">
              {isListening ? (
                <VoiceWaveOrb isListening={true} size={126} />
              ) : (
                <button
                  onClick={handleMicClick}
                  disabled={!micEnabled}
                  className="transition-all disabled:opacity-40"
                >
                  <div 
                    className="w-18 h-18 rounded-full flex items-center justify-center"
                    style={{
                      width: '72px',
                      height: '72px',
                      background: micEnabled ? 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' : '#E5E7EB',
                      border: micEnabled ? 'none' : '2px solid #D1D5DB'
                    }}
                  >
                    <Mic 
                      className="w-7 h-7" 
                      style={{ color: micEnabled ? 'white' : '#9CA3AF' }}
                    />
                  </div>
                </button>
              )}
            </div>

            {/* Text Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && textValue.trim()) {
                    handleTextSubmit();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 px-5 py-3.5 rounded-full text-sm border-2 focus:outline-none transition-colors"
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  color: '#15113C',
                  background: 'white',
                  borderColor: textValue.trim() ? '#C4B5FD' : '#E5E7EB'
                }}
              />
              <button
                onClick={handleTextSubmit}
                disabled={!textValue.trim()}
                className="w-12 h-12 rounded-full transition-all disabled:opacity-40 flex items-center justify-center"
                style={{ 
                  background: textValue.trim() ? 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' : '#F3F4F6',
                  border: textValue.trim() ? 'none' : '2px solid #D1D5DB'
                }}
              >
                <ArrowUp 
                  className="w-5 h-5" 
                  style={{ color: textValue.trim() ? 'white' : '#9CA3AF' }}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );

  // Render breathing exercise overlay
  if (activeActivity === 'breathing') {
    return (
      <BreathingExercise 
        onComplete={() => handleActivityComplete('breathing')}
        onSwitch={() => setActiveActivity('gratitude')}
      />
    );
  }

  // Render gratitude exercise overlay
  if (activeActivity === 'gratitude') {
    return (
      <GratitudeExercise 
        onComplete={() => handleActivityComplete('gratitude')}
        onSwitch={() => setActiveActivity('breathing')}
      />
    );
  }

  // Render ZER screen
  if (activeActivity === 'zow') {
    return (
      <ZOWScreen 
        userName={userName}
        onComplete={() => setActiveActivity(null)}
      />
    );
  }

  // Render insight reel screen
  if (showingInsightReel) {
    return (
      <InsightReelScreen 
        type={showingInsightReel.type}
        title={showingInsightReel.title}
        description={showingInsightReel.description}
        highlight={showingInsightReel.highlight}
        fact={showingInsightReel.fact}
        backgroundMedia={showingInsightReel.backgroundMedia}
        onComplete={handleInsightReelComplete}
      />
    );
  }

  // Render based on active tab
  if (activeTab === "activities") {
    return (
      <>
        <EnhancedHomeScreen userName={userName} oracleName={oracleName} onOpenNotifications={() => { setShowNotifications(true); setActiveTab("profile"); setNotifUnreadCount(0); }} notifUnreadCount={notifUnreadCount} />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </>
    );
  }
  
  if (activeTab === "insights") {
    // If burnout analytics is being shown, render that instead
    if (showBurnoutAnalytics) {
      return (
        <div className="min-h-screen flex flex-col">
          {/* Header with back button */}
          <div
            className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b"
            style={{
              background: 'linear-gradient(135deg, rgba(250, 245, 255, 0.95) 0%, rgba(252, 231, 243, 0.9) 50%, rgba(235, 248, 255, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(229, 231, 235, 0.5)'
            }}
          >
            <button
              onClick={() => setShowBurnoutAnalytics(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '2px solid #E5E7EB'
              }}
            >
              <ArrowUp className="w-4 h-4 transform rotate-[-90deg]" style={{ color: '#6B7280' }} />
            </button>
            <h3
              className="text-base"
              style={{
                fontFamily: 'Lora, serif',
                fontWeight: 500,
                color: '#15113C'
              }}
            >
              Burnout Analytics
            </h3>
          </div>
          <BurnoutAnalytics />
          <BottomNav activeTab={activeTab} onTabChange={(tab) => {
            setShowBurnoutAnalytics(false);
            handleTabChange(tab);
          }} />
        </div>
      );
    }

    return (
      <>
        <InsightsScreen onViewBurnoutAnalytics={() => setShowBurnoutAnalytics(true)} onOpenNotifications={() => { setShowNotifications(true); setActiveTab("profile"); setNotifUnreadCount(0); }} notifUnreadCount={notifUnreadCount} />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </>
    );
  }
  
  if (activeTab === "tools") {
    // If showing games hub
    if (showGamesHub) {
      // If playing a specific game
      if (activeGame === "color-tap") {
        return <ColorTapGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "breathing-rhythm") {
        return <BreathingRhythmGame onClose={() => setActiveGame(null)} onComplete={(breathCount) => setActiveGame(null)} />;
      }
      if (activeGame === "sound-hunter") {
        return <SoundHunterGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "freeze-switch") {
        return <FreezeSwitchGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "distraction-dodge") {
        return <DistractionDodgeGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "pattern-recall") {
        return <PatternRecallGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "object-tray") {
        return <ObjectTrayGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "story-builder") {
        return <StoryBuilderGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "path-memory") {
        return <PathMemoryGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "emotion-match") {
        return <EmotionMatchGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "storm-balance") {
        return <StormBalanceGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "thought-sort") {
        return <ThoughtSortGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "growth-garden") {
        return <GrowthGardenGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "emotion-compass") {
        return <EmotionCompassGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "rule-switch") {
        return <RuleSwitchGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "shape-shift-puzzle") {
        return <ShapeShiftPuzzleGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "multi-task-relay") {
        return <MultiTaskRelayGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "zen-sand") {
        return <ZenSandGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }
      if (activeGame === "cloud-drift") {
        return <CloudDriftGame onClose={() => setActiveGame(null)} onComplete={(score) => setActiveGame(null)} />;
      }

      // Show games hub
      return (
        <div className="min-h-screen flex flex-col">
          {/* Header with back button */}
          <div
            className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b"
            style={{
              background: 'linear-gradient(135deg, rgba(250, 245, 255, 0.95) 0%, rgba(252, 231, 243, 0.9) 50%, rgba(235, 248, 255, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(229, 231, 235, 0.5)'
            }}
          >
            <button
              onClick={() => setShowGamesHub(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '2px solid #E5E7EB'
              }}
            >
              <ArrowUp className="w-4 h-4 transform rotate-[-90deg]" style={{ color: '#6B7280' }} />
            </button>
            <h3
              className="text-base"
              style={{
                fontFamily: 'Lora, serif',
                fontWeight: 500,
                color: '#15113C'
              }}
            >
              Mindful Games
            </h3>
          </div>
          <GamesHub onSelectGame={(gameId) => setActiveGame(gameId)} />
          <BottomNav activeTab={activeTab} onTabChange={(tab) => {
            setShowGamesHub(false);
            setActiveTab(tab);
          }} />
        </div>
      );
    }

    // Assessment hub
    if (showAssessmentHub && !activeTool) {
      return (
        <AssessmentHubScreen
          onBack={() => setShowAssessmentHub(false)}
          onSelectAssessment={(id) => { setActiveTool(id); }}
        />
      );
    }

    // Tool inner screens
    const closeTool = () => {
      const toolKey = activeTool === 'breath' ? 'breathing'
        : activeTool === 'gratitude' ? 'gratitude'
        : activeTool === 'zer' ? 'zer'
        : 'tool';
      const cSet = CONTEXTUAL_SETS[toolKey];
      if (cSet) {
        setMessages(prev => [...prev, { type: 'contextual-actions', intro: cSet.intro, cards: cSet.cards } as MessageType]);
      }
      setActiveTool(null);
      setShowHealthScreens(false);
    };

    // Assessment completion → show AboutYourHealth screens first
    const closeAssessment = () => setShowHealthScreens(true);

    // Health screens active (shown after assessment result "Done" is tapped)
    if (showHealthScreens) {
      return (
        <AboutYourHealthScreen
          onComplete={(_answers) => closeTool()}
          onSkip={closeTool}
        />
      );
    }

    if (activeTool === "breath") return <BreathLoopsScreen onDone={closeTool} />;
    if (activeTool === "disidentification") return <DisidentificationScreen onDone={closeTool} />;
    if (activeTool === "imagery") return <GuidedImageryScreen onDone={closeTool} />;
    if (activeTool === "gratitude") return <GratitudeJournalScreen onDone={closeTool} />;
    if (activeTool === "will") return <WillTrainingScreen onDone={closeTool} />;
    if (activeTool === "ritual") return <RitualBuilderScreen onDone={closeTool} />;
    if (activeTool === "subpersonality") return <SubpersonalityWorkScreen onDone={closeTool} />;
    if (activeTool === "bodyscan") return <BodyScanScreen onDone={closeTool} />;
    if (activeTool === "zer") return <ZERScreen onDone={closeTool} />;
    if (activeTool === "affirmations") return <AffirmationsScreen onDone={closeTool} />;
    if (activeTool === "grounding") return <CrisisGroundingScreen onDone={closeTool} />;
    if (activeTool === "sleep") return <SleepRitualScreen onDone={closeTool} />;
    if (activeTool === "crisis") return <CrisisGroundingScreen onDone={closeTool} />;
    if (activeTool === "gratitude-assess") return <GratitudeAssessmentScreen onDone={closeAssessment} onStartTool={(id) => setActiveTool(id)} onOpenChatWithPrompt={handleOpenChatWithPrompt} />;
    if (activeTool === "anxiety-assess") return <AnxietyAssessmentScreen onDone={closeAssessment} onStartTool={(id) => setActiveTool(id)} onOpenChatWithPrompt={handleOpenChatWithPrompt} />;
    if (activeTool === "trauma-assess") return <TraumaAssessmentScreen onDone={closeAssessment} onStartTool={(id) => setActiveTool(id)} onOpenChatWithPrompt={handleOpenChatWithPrompt} />;
    if (activeTool === "burnout-bat") return <BurnoutBATScreen onDone={closeAssessment} onStartTool={(id) => setActiveTool(id)} onOpenChatWithPrompt={handleOpenChatWithPrompt} />;
    if (activeTool === "gad7") return <GAD7Screen onDone={closeAssessment} onStartTool={(id) => setActiveTool(id)} onOpenChatWithPrompt={handleOpenChatWithPrompt} />;
    if (activeTool === "dass") return <DASSScreen onDone={closeAssessment} onStartTool={(id) => setActiveTool(id)} onOpenChatWithPrompt={handleOpenChatWithPrompt} />;
    if (activeTool === "grat") return <GRATScreen onDone={closeAssessment} onStartTool={(id) => setActiveTool(id)} onOpenChatWithPrompt={handleOpenChatWithPrompt} />;
    if (activeTool === "olbi") return <OLBIScreen onDone={closeAssessment} onStartTool={(id) => setActiveTool(id)} onOpenChatWithPrompt={handleOpenChatWithPrompt} />;
    if (activeTool === "cbi") return <CBIScreen onDone={closeAssessment} onStartTool={(id) => setActiveTool(id)} onOpenChatWithPrompt={handleOpenChatWithPrompt} />;
    if (activeTool === "ace") return <ACEScreen onDone={closeAssessment} onStartTool={(id) => setActiveTool(id)} onOpenChatWithPrompt={handleOpenChatWithPrompt} />;
    if (activeTool === "siboq") return <SIBOQScreen onDone={closeAssessment} onStartTool={(id) => setActiveTool(id)} onOpenChatWithPrompt={handleOpenChatWithPrompt} />;
    if (activeTool === "rbst") return <RBSTScreen onDone={closeAssessment} onStartTool={(id) => setActiveTool(id)} onOpenChatWithPrompt={handleOpenChatWithPrompt} />;

    return (
      <>
        <ToolsScreen
          onNavigateToGames={() => setShowGamesHub(true)}
          onOpenAssessmentHub={() => { setShowAssessmentHub(true); }}
          onSelectTool={(toolId) => setActiveTool(toolId)}
          onOpenNotifications={() => { setShowNotifications(true); setActiveTab("profile"); setNotifUnreadCount(0); }}
          notifUnreadCount={notifUnreadCount}
        />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </>
    );
  }
  
  if (activeTab === "profile") {
    if (showNotifications) {
      return <NotificationsScreen onBack={() => setShowNotifications(false)} />;
    }
    return (
      <>
        <ProfileScreen
          userName={userName}
          oracleName={oracleName}
          onOpenNotifications={() => setShowNotifications(true)}
        />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </>
    );
  }
  
  return renderChatView();
}
import { useState, useRef, useEffect } from "react";
import { Mic, Volume2, VolumeX, Heart, BookOpen, Smile, TrendingUp, User, Settings, Lock, HelpCircle, Info, Calendar, Lightbulb, Zap } from "lucide-react";
import { VoiceWaveOrb } from "./VoiceWaveOrb";
import { BottomNav } from "./BottomNav";
import { AnimatedLogo } from "./AnimatedLogo";
import { ZOWScreen } from "./ZOWScreen";
import { ToolsScreen } from "./ToolsScreen";
import { InsightsScreen } from "./InsightsScreen";
import { EnhancedHomeScreen } from "./EnhancedHomeScreen";

interface VoiceChatScreenProps {
  oracleName: string;
  userName: string;
  onClose: () => void;
}

interface Message {
  text: string;
  sender: 'user' | 'oracle';
  hasAudio?: boolean;
  stageInsight?: {
    stage: string;
    description: string;
    actions: { label: string; color: string }[];
  };
  narrativeCard?: {
    type: 'session' | 'reflection' | 'pattern' | 'breakthrough';
    title: string;
    description: string;
    metadata?: string;
    color?: string;
  };
}

export function VoiceChatScreen({ oracleName, userName }: VoiceChatScreenProps) {
  const [isListening, setIsListening] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "",
      sender: 'oracle',
      narrativeCard: {
        type: 'session',
        title: 'Previous Session',
        description: 'March 13, 2026 · 18 min conversation',
        metadata: 'Explored: Work boundaries, Manager relationship, Self-advocacy',
        color: '#E0E7FF'
      }
    },
    {
      text: "I finally spoke up in the team meeting today. It felt scary but necessary.",
      sender: 'user',
      hasAudio: true
    },
    {
      text: "That's powerful. What shifted for you to find that voice?",
      sender: 'oracle'
    },
    {
      text: "",
      sender: 'oracle',
      narrativeCard: {
        type: 'breakthrough',
        title: 'Breakthrough Moment',
        description: 'You recognized your own agency — that external validation isn\'t required for your voice to matter.',
        metadata: 'Self-authorization',
        color: '#DBEAFE'
      }
    },
    {
      text: `Welcome back, ${userName}. What's been alive in your inner world?`,
      sender: 'oracle'
    }
  ]);
  const [activeTab, setActiveTab] = useState<"activities" | "chat" | "insights" | "tools" | "profile">("chat");
  const [micEnabled, setMicEnabled] = useState(true);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showActionItems, setShowActionItems] = useState(true); // Show by default
  const [showZEROverlay, setShowZEROverlay] = useState(false); // ZER overlay state
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMicClick = () => {
    if (!micEnabled) return;
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate listening and response
      setTimeout(() => {
        setIsListening(false);
        const userMsg: Message = { 
          text: "I've been feeling really stuck with my manager. It's making me anxious and I can't stop overthinking.",
          sender: 'user',
          hasAudio: true
        };
        setMessages(prev => [...prev, userMsg]);
        
        // Oracle types response
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, 
              { 
                text: "That sounds genuinely hard. The looping thoughts — your mind is searching for safety. What does that anxious feeling feel like in your body right now?",
                sender: 'oracle'
              },
              {
                text: "",
                sender: 'oracle',
                stageInsight: {
                  stage: "DELIBERATION",
                  description: "This is a deliberation moment — your mind is processing competing narratives. You are not your story.",
                  actions: [
                    { label: "Breathe", color: "#10B981" },
                    { label: "Disidentify", color: "#8B5CF6" }
                  ]
                }
              }
            ]);
          }, 2000);
        }, 500);
      }, 2500);
    }
  };

  const handleTextSubmit = () => {
    if (textValue.trim()) {
      const userMsg: Message = { 
        text: textValue, 
        sender: 'user',
        hasAudio: false
      };
      setMessages(prev => [...prev, userMsg]);
      setTextValue('');
      
      // Oracle types response
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, 
            { 
              text: `I hear you, ${userName}. Let's explore that together.`,
              sender: 'oracle'
            }
          ]);
        }, 1500);
      }, 500);
    }
  };

  const playAudio = (text: string) => {
    if (speakerEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Chat View (Voice-First Mode - DEFAULT)
  const renderChatView = () => (
    <div 
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}
    >
      {/* Voice Wave Area - 30% */}
      <div 
        className="relative flex flex-col items-center justify-center border-b"
        style={{ 
          height: '30vh',
          background: 'linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 50%, #F5F3FF 100%)',
          borderColor: '#F3F4F6'
        }}
      >
        {/* Oracle Name & Status */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <AnimatedLogo size={32} animate={isListening} />
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

        {/* Mic/Speaker Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setSpeakerEnabled(!speakerEnabled)}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: speakerEnabled ? 'white' : '#F3F4F6',
              border: `2px solid ${speakerEnabled ? '#C4B5FD' : '#E5E7EB'}`
            }}
          >
            {speakerEnabled ? (
              <Volume2 className="w-4 h-4" style={{ color: '#8B5CF6' }} />
            ) : (
              <VolumeX className="w-4 h-4" style={{ color: '#9CA3AF' }} />
            )}
          </button>
          <button
            onClick={() => setMicEnabled(!micEnabled)}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: micEnabled ? 'white' : '#F3F4F6',
              border: `2px solid ${micEnabled ? '#C4B5FD' : '#E5E7EB'}`
            }}
          >
            <Mic 
              className="w-4 h-4" 
              style={{ color: micEnabled ? '#8B5CF6' : '#9CA3AF' }}
            />
          </button>
        </div>

        {/* Voice Wave Animation or Mic Button */}
        <div className="flex-1 flex items-center justify-center">
          {isListening ? (
            <VoiceWaveOrb isListening={true} size={180} />
          ) : (
            <button
              onClick={handleMicClick}
              disabled={!micEnabled}
              className="transition-all disabled:opacity-40"
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: micEnabled ? '#8B5CF6' : '#E5E7EB',
                  border: micEnabled ? 'none' : '2px solid #D1D5DB'
                }}
              >
                <Mic 
                  className="w-10 h-10" 
                  style={{ color: 'white' }}
                />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Content Area - 70% */}
      <div 
        className="flex flex-col"
        style={{ height: '70vh' }}
      >
        {/* Action Items - Conditional (10% of chat space) */}
        {showActionItems && (
          <div 
            className="px-4 py-4 border-b overflow-x-auto"
            style={{ 
              background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)',
              borderColor: '#F3F4F6',
              minHeight: '10vh'
            }}
          >
            <div className="flex items-center gap-3 pb-2" style={{ minWidth: 'max-content' }}>
              <button
                onClick={() => setShowZEROverlay(true)}
                className="px-5 py-3 rounded-full text-sm flex items-center gap-2.5 whitespace-nowrap flex-shrink-0 transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
                  color: '#8B5CF6',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  border: '1.5px solid rgba(139,92,246,0.3)'
                }}
              >
                <Heart className="w-4 h-4" />
                ZER Check-in
              </button>
              <button
                className="px-5 py-3 rounded-full text-sm flex items-center gap-2.5 whitespace-nowrap flex-shrink-0 transition-all hover:opacity-90"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  color: '#8B5CF6',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  border: '1.5px solid rgba(139,92,246,0.2)'
                }}
              >
                <BookOpen className="w-4 h-4" />
                Complete Daily Reflection
              </button>
              <button
                className="px-5 py-3 rounded-full text-sm flex items-center gap-2.5 whitespace-nowrap flex-shrink-0 transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
                  color: '#8B5CF6',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  border: '2px solid #8B5CF6'
                }}
              >
                <Smile className="w-4 h-4" />
                Update Mood Check-in
              </button>
            </div>
          </div>
        )}

        {/* Messages (60% of chat space) */}
        <div 
          className="flex-1 overflow-y-auto px-4 pt-4 pb-24"
          style={{ background: '#F9FAFB' }}
        >
          <div className="space-y-3 max-w-2xl mx-auto">
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.narrativeCard ? (
                  // Narrative Card
                  <div 
                    className="p-5 rounded-3xl mb-4"
                    style={{ 
                      background: msg.narrativeCard.color || '#F3F4F6',
                      border: '2px solid #E5E7EB'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: msg.narrativeCard.type === 'session' ? '#818CF8' :
                                     msg.narrativeCard.type === 'breakthrough' ? '#60A5FA' :
                                     msg.narrativeCard.type === 'pattern' ? '#FBBF24' :
                                     '#A78BFA'
                        }}
                      >
                        {msg.narrativeCard.type === 'session' && <Calendar className="w-5 h-5" style={{ color: 'white' }} />}
                        {msg.narrativeCard.type === 'breakthrough' && <Zap className="w-5 h-5" style={{ color: 'white' }} />}
                        {msg.narrativeCard.type === 'pattern' && <TrendingUp className="w-5 h-5" style={{ color: 'white' }} />}
                        {msg.narrativeCard.type === 'reflection' && <Lightbulb className="w-5 h-5" style={{ color: 'white' }} />}
                      </div>
                      <div className="flex-1">
                        <h4 
                          className="text-sm mb-1"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            color: '#15113C',
                            fontWeight: 600
                          }}
                        >
                          {msg.narrativeCard.title}
                        </h4>
                        <p 
                          className="text-sm mb-2"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            color: '#4B5563',
                            lineHeight: 1.5
                          }}
                        >
                          {msg.narrativeCard.description}
                        </p>
                        {msg.narrativeCard.metadata && (
                          <p 
                            className="text-xs"
                            style={{ 
                              fontFamily: 'Inter, sans-serif',
                              color: '#6B7280',
                              fontStyle: 'italic'
                            }}
                          >
                            {msg.narrativeCard.metadata}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : msg.stageInsight ? (
                  // Stage Insight Card
                  <div 
                    className="p-4 rounded-3xl mb-4"
                    style={{ 
                      background: '#F3F4F6',
                      border: '2px solid #E5E7EB'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ background: '#C4B5FD' }}
                      />
                      <span 
                        className="text-xs"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          color: '#8B5CF6',
                          fontWeight: 600,
                          letterSpacing: '0.05em'
                        }}
                      >
                        STAGE INSIGHT · {msg.stageInsight.stage}
                      </span>
                    </div>
                    <p 
                      className="text-sm mb-3"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#4B5563',
                        lineHeight: 1.6
                      }}
                    >
                      {msg.stageInsight.description}
                    </p>
                    <div className="flex gap-2">
                      {msg.stageInsight.actions.map((action, idx) => (
                        <button
                          key={idx}
                          className="px-4 py-2 rounded-full text-xs flex items-center gap-1.5"
                          style={{ 
                            background: action.color,
                            color: 'white',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500
                          }}
                        >
                          <div className="w-3 h-3 rounded" style={{ background: 'rgba(255,255,255,0.3)' }} />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Message Bubble
                  <div className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'oracle' && (
                      <div 
                        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}
                      >
                        <AnimatedLogo size={16} animate={false} />
                      </div>
                    )}
                    
                    <div 
                      className="px-4 py-2.5 rounded-3xl max-w-xs"
                      style={{
                        background: msg.sender === 'user' 
                          ? 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)' 
                          : 'white',
                        color: msg.sender === 'user' ? 'white' : '#15113C',
                        border: msg.sender === 'oracle' ? '2px solid #F3F4F6' : 'none'
                      }}
                    >
                      <p 
                        className="text-sm leading-relaxed"
                        style={{ 
                          fontFamily: msg.sender === 'oracle' ? 'Lora, serif' : 'Inter, sans-serif',
                          fontStyle: msg.sender === 'oracle' ? 'italic' : 'normal'
                        }}
                      >
                        {msg.text}
                      </p>
                    </div>
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
                  <AnimatedLogo size={16} animate={false} />
                </div>
                <div 
                  className="px-4 py-2.5 rounded-3xl"
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

        {/* Text Input - Always Available */}
        <div 
          className="fixed bottom-20 left-0 right-0 px-4 py-3"
          style={{ background: 'linear-gradient(to top, #F9FAFB 0%, #F9FAFB 90%, transparent 100%)' }}
        >
          <div className="max-w-2xl mx-auto flex items-center gap-2">
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
              className="flex-1 px-5 py-3 rounded-full text-sm border-2 focus:outline-none transition-colors"
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
              className="w-11 h-11 rounded-full transition-all disabled:opacity-40 flex items-center justify-center"
              style={{ 
                background: textValue.trim() ? '#8B5CF6' : '#F3F4F6'
              }}
            >
              <div 
                className="w-4 h-4 rounded"
                style={{ background: textValue.trim() ? 'white' : '#9CA3AF' }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );

  // Insights View
  const renderInsightsView = () => (
    <div 
      className="min-h-screen relative overflow-hidden flex flex-col pb-24"
      style={{ 
        background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)',
        padding: '16px'
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <AnimatedLogo size={64} animate={false} />
        </div>

        <h1 
          className="text-3xl mb-3 text-center" 
          style={{ 
            fontFamily: 'Lora, serif', 
            fontWeight: 500, 
            lineHeight: 1.3, 
            color: '#15113C' 
          }}
        >
          Your Insights
        </h1>

        <p 
          className="text-base text-gray-600 mb-12 text-center max-w-md" 
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Track your progress and understand your patterns
        </p>

        <div className="w-full max-w-md space-y-4">
          <div 
            className="p-6 rounded-3xl"
            style={{ background: 'white', border: '2px solid #FED7AA' }}
          >
            <h3 
              className="text-lg mb-2" 
              style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}
            >
              Coming Soon
            </h3>
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Your personalized insights will appear here
            </p>
          </div>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );

  // Profile View
  const renderProfileView = () => {
    const profileOptions = [
      { label: 'Account Settings', icon: User },
      { label: 'Oracle Preferences', icon: Settings },
      { label: 'Privacy & Data', icon: Lock },
      { label: 'Help & Support', icon: HelpCircle },
      { label: 'About CereBro', icon: Info }
    ];

    return (
      <div 
        className="min-h-screen relative overflow-hidden flex flex-col pb-24"
        style={{ 
          background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)',
          padding: '16px'
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto w-full">
          <div className="mb-6">
            <AnimatedLogo size={64} animate={false} />
          </div>

          <h1 
            className="text-3xl mb-3 text-center" 
            style={{ 
              fontFamily: 'Lora, serif', 
              fontWeight: 500, 
              lineHeight: 1.3, 
              color: '#15113C' 
            }}
          >
            {userName}
          </h1>

          <p 
            className="text-base mb-12 text-center" 
            style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}
          >
            Your Personal Oracle: {oracleName}
          </p>

          <div className="w-full max-w-md space-y-3">
            {profileOptions.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="w-full p-5 rounded-3xl text-left transition-all hover:shadow-sm flex items-center gap-4"
                style={{ 
                  background: 'white',
                  border: '2px solid #E9D5FF'
                }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#7C3AED' }} />
                </div>
                <p 
                  className="text-base flex-1" 
                  style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 500 }}
                >
                  {label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  };

  // Render based on active tab
  if (activeTab === "activities") {
    return (
      <>
        <EnhancedHomeScreen userName={userName} oracleName={oracleName} />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </>
    );
  }
  
  if (activeTab === "insights") {
    return (
      <>
        <InsightsScreen />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </>
    );
  }
  
  if (activeTab === "tools") {
    return (
      <>
        <ToolsScreen />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </>
    );
  }
  
  if (activeTab === "profile") return renderProfileView();
  
  // Show ZER overlay if active
  if (showZEROverlay) {
    return (
      <div className="relative">
        <ZOWScreen 
          userName={userName} 
          onComplete={() => setShowZEROverlay(false)} 
        />
      </div>
    );
  }
  
  return renderChatView();
}
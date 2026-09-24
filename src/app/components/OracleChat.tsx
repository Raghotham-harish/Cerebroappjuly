import { useState, useRef, useEffect } from "react";
import { VoiceOrb } from "./VoiceOrb";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Send, Mic, MicOff, Menu, User } from "lucide-react";
import { MockPermissionDialog } from "./MockPermissionDialog";
import { VoiceRecorder } from "./VoiceRecorder";

interface Message {
  id: string;
  sender: "user" | "oracle";
  content: string;
  timestamp: Date;
}

interface OracleChatProps {
  oracleName: string;
  oracleAvatar: string;
  userName?: string;
}

export function OracleChat({ oracleName, oracleAvatar, userName = "You" }: OracleChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "oracle",
      content: `Hello! I'm ${oracleName}, your personal AI oracle. I'm here to support your mental wellness journey. How are you feeling today?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceTranscript = (transcript: string) => {
    setInputValue(transcript);
    // Auto-send after a brief delay
    setTimeout(() => {
      handleSendMessage(transcript);
    }, 500);
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: messageText,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate oracle response
    setTimeout(() => {
      const responses = [
        "Thank you for sharing that with me. How does that make you feel?",
        "I hear you. It's important to acknowledge these feelings. What would help you feel better right now?",
        "That's a valuable insight. Have you noticed any patterns in these thoughts?",
        "I appreciate your openness. Remember, it's okay to feel this way. What small step could you take today?",
        "Your awareness is a sign of growth. How can I support you further with this?"
      ];
      
      const oracleResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "oracle",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, oracleResponse]);
      setIsTyping(false);
      
      // Speak oracle response (disabled for mock - no actual TTS)
      /* Real text-to-speech code (disabled for mock)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(oracleResponse.content);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      }
      */
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
      <div className="absolute inset-0 bg-gradient-to-tl from-indigo-100/20 via-transparent to-pink-100/20" />
      
      {/* Subtle floating orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      
      {/* Header */}
      <div className="relative z-10 px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
              Chat with {oracleName}
            </h1>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 text-gray-800 shadow-sm"
                    : "bg-white/70 backdrop-blur-sm text-gray-800 shadow-sm border border-white/30"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-2 text-gray-400">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-sm border border-white/30">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Voice orb overlay (when recording) */}
      {isRecording && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/30 backdrop-blur-sm">
          <div className="text-center">
            <VoiceOrb isListening={true} isSpeaking={false} size={280} />
            <p className="mt-6 text-gray-700 text-lg" style={{ fontFamily: 'Lora, serif' }}>Listening...</p>
            <p className="mt-2 text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Demo Mode: Simulating voice input</p>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="relative z-10 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-2 flex items-end gap-2">
            <VoiceRecorder 
              onTranscript={handleVoiceTranscript}
              disabled={isTyping}
              variant="button"
            />
            
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share your thoughts..."
              className="flex-1 min-h-[44px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-gray-700"
              rows={1}
            />
            
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              size="icon"
              className="rounded-xl shrink-0 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-gray-800 shadow-md"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-600 text-center mt-2">
            Press Enter to send • Shift+Enter for new line • Click mic for voice
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { ArrowLeft, RefreshCw, Mic, MicOff, Heart } from "lucide-react";

function speakText(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.9; utt.pitch = 1;
  const preferred = window.speechSynthesis.getVoices().find(v => v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Google US English Female"));
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
}

interface GratitudeJournalScreenProps {
  onDone: () => void;
}

const promptSets = [
  ["What made you smile today, even briefly?", "Who showed up for you recently — how?", "What simple comfort are you grateful for right now?"],
  ["What strength within you are you thankful for?", "What in nature brought you peace this week?", "What ordinary moment turned out to be beautiful?"],
  ["What challenge taught you something valuable?", "Who in your life do you appreciate most today?", "What opportunity are you grateful to have?"],
  // Three Good Things — what went well + why
  ["What went well today — even one small thing?", "Why did that good thing happen?", "What role did you play in making it possible?"],
  // Unsung Hero — relational acknowledgment
  ["Who performed a quiet act of kindness for you recently?", "What did they do, and why was it thoughtful?", "Is there a small way you could acknowledge them?"],
  // Sensory Appreciation — one-sense focus
  ["What pleasant sensation have you noticed today — a sound, scent, or feeling?", "What everyday object makes your life easier that you often overlook?", "What in your immediate surroundings right now brings quiet comfort?"],
  // Silver Lining — reframing a setback
  ["What was one frustration or setback this week?", "What unexpected lesson or silver lining came out of it?", "How has a past difficulty shaped you into who you are today?"],
  // Laughter Recall — relational lightness
  ["Who made you genuinely laugh or smile recently?", "What was a moment of lightness or playfulness this week?", "What relationship in your life are you most grateful for right now?"],
  // Mental Subtraction — appreciating what exists
  ["Name one good thing in your life you might take for granted.", "What would life look like without it?", "Returning to the present — what do you see more clearly now?"],
];

const PURPLE = "#8B5CF6";
const PAGE_BG = "linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)";
const DONE_BG = "linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 100%)";

const promptLabels = ["First", "Second", "Third"];

export function GratitudeJournalScreen({ onDone }: GratitudeJournalScreenProps) {
  const [promptSetIdx, setPromptSetIdx] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [submitted, setSubmitted] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);

  const prompts = promptSets[promptSetIdx];

  const toggleVoice = () => {
    if (voiceOn) { window.speechSynthesis?.cancel(); setVoiceOn(false); }
    else { setVoiceOn(true); speakText(promptSets[promptSetIdx].join(". ")); }
  };

  const handleSubmit = () => {
    if (answers.filter((a) => a.trim()).length >= 1) { window.speechSynthesis?.cancel(); setSubmitted(true); }
  };

  const shufflePrompts = () => {
    const next = (promptSetIdx + 1) % promptSets.length;
    setPromptSetIdx(next);
    setAnswers(["", "", ""]);
    if (voiceOn) speakText(promptSets[next].join(". "));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: DONE_BG }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "#8B5CF6" }}>
          <Heart className="w-10 h-10" style={{ color: "white", strokeWidth: 1.5 }} />
        </div>
        <h2 className="text-2xl mb-3 text-center" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
          Thank you for noticing
        </h2>
        <p className="text-sm mb-10 text-center max-w-xs" style={{ fontFamily: "Inter, sans-serif", color: "#4B5563", lineHeight: 1.6 }}>
          Gratitude rewires the brain toward abundance. Come back tomorrow.
        </p>
        <button onClick={onDone} className="cb-btn-primary" style={{ maxWidth: "240px" }}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PAGE_BG, padding: "16px", paddingBottom: "40px" }}>
      {/* Header */}
      <div className="flex items-center justify-between pt-8 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={onDone} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.07)" }}>
            <ArrowLeft className="w-5 h-5" style={{ color: "#15113C" }} />
          </button>
          <div>
            <h1 className="text-2xl" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>Gratitude Journal</h1>
            <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>Daily anchoring practice</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleVoice} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: voiceOn ? "#EDE9FE" : "rgba(255,255,255,0.7)", border: voiceOn ? "1.5px solid #8B5CF6" : "1.5px solid rgba(0,0,0,0.07)" }}>
            {voiceOn ? <Mic className="w-4 h-4" style={{ color: "#7C3AED" }} /> : <MicOff className="w-4 h-4" style={{ color: "#15113C" }} />}
          </button>
          <button onClick={shufflePrompts} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.07)" }}>
            <RefreshCw className="w-4 h-4" style={{ color: "#15113C" }} />
          </button>
        </div>
      </div>

      {/* Decorative strip */}
      <div className="flex items-center gap-2 mb-5 mt-4 px-1">
        <div className="h-px flex-1" style={{ background: "linear-gradient(to right, #FDE68A, transparent)" }} />
        <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#D97706", fontWeight: 600, letterSpacing: "0.08em" }}>TODAY'S PROMPTS</span>
        <div className="h-px flex-1" style={{ background: "linear-gradient(to left, #FDE68A, transparent)" }} />
      </div>

      <div className="space-y-4 flex-1">
        {prompts.map((prompt, i) => (
          <div
            key={i}
            className="rounded-3xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(217,119,6,0.18)", boxShadow: "0 2px 12px rgba(217,119,6,0.07)" }}
          >
            {/* Prompt label band */}
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: "rgba(253,230,138,0.35)", borderBottom: "1px solid rgba(217,119,6,0.12)" }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#D97706" }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "white", fontWeight: 700 }}>{i + 1}</span>
              </div>
              <p className="text-sm flex-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#78350F" }}>
                {prompt}
              </p>
            </div>
            {/* Textarea */}
            <div className="p-4">
              <textarea
                value={answers[i]}
                onChange={(e) => { const u = [...answers]; u[i] = e.target.value; setAnswers(u); }}
                placeholder="Write freely…"
                rows={3}
                className="w-full px-3 py-2.5 rounded-2xl text-sm resize-none focus:outline-none"
                style={{ fontFamily: "Inter, sans-serif", fontStyle: answers[i] ? "normal" : "italic", color: "#15113C", background: "rgba(255,251,235,0.8)", border: "1.5px solid rgba(217,119,6,0.15)" }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full py-4 rounded-full text-sm font-semibold transition-all"
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "15px",
          background: answers.some(a => a.trim()) ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" : "#F3F4F6",
          color: answers.some(a => a.trim()) ? "white" : "#9CA3AF",
          cursor: answers.some(a => a.trim()) ? "pointer" : "not-allowed",
          boxShadow: answers.some(a => a.trim()) ? "0 4px 20px rgba(217,119,6,0.3)" : "none",
        }}
      >
        Save entry
      </button>
    </div>
  );
}

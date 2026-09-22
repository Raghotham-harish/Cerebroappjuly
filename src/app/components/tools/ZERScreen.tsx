import { useState, useRef, type MouseEvent, type TouchEvent } from "react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";

interface ZERScreenProps {
  onDone: () => void;
}

type ZerStep = "locate" | "emotion" | "strategy" | "done";

const PURPLE = "#8B5CF6";
const PAGE_BG = "linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)";
const DONE_BG = "linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 100%)";

// ── ZER colour + arousal helpers (mirrors ZOWCapture) ────────────────────────
function getZERColor(score: number): string {
  if (score === 7) return "#F97316";
  if (score === 6) return "#F59E0B";
  if (score >= 3)  return "#10B981";
  if (score === 2) return "#FBBF24";
  return "#F97316";
}

function getZERArousal(score: number): string {
  if (score >= 6) return "Hyper arousal";
  if (score >= 3) return "Regulates";
  return "Hypo arousal";
}

function getZoneKey(score: number): "hyper" | "regulates" | "hypo" {
  if (score >= 6) return "hyper";
  if (score >= 3) return "regulates";
  return "hypo";
}

function isOutOfZone(score: number) {
  return score <= 2 || score >= 6;
}

// ── Zone emotion words + descriptions ────────────────────────────────────────
const ZONE_DATA: Record<"hyper" | "regulates" | "hypo", {
  color: string;
  label: string;
  strategy: string;
  words: string[];
  description: string;
  strategySteps: string[];
}> = {
  hyper: {
    color: "#F97316",
    label: "Hyper arousal",
    strategy: "Regulate & Release",
    words: ["Anxious", "Activated", "Alert", "Overwhelmed", "Reactive", "Tense", "Wired"],
    description: "High energy state — your nervous system is elevated. Use grounding or breath to regulate.",
    strategySteps: [
      "Name the emotion: \"I am feeling [X] right now. This is temporary.\"",
      "Activate your body: 3 deep breaths (4 in, 7 hold, 8 out).",
      "Physical release: stretch, shake your hands, or walk for 2 minutes.",
      "Identify the trigger: What specifically sparked this? Is it a fact or a thought?",
    ],
  },
  regulates: {
    color: "#10B981",
    label: "Regulated",
    strategy: "Sustain & Receive",
    words: ["Calm", "Grounded", "Present", "Centered", "Settled", "Clear", "Balanced"],
    description: "You are in the window of tolerance — able to think, feel and respond with clarity.",
    strategySteps: [
      "Name and honour this state: \"I feel at peace. I deserve this.\"",
      "Let yourself receive it without rushing past it.",
      "Take 3 slow breaths and let each exhale deepen the calm.",
      "Note one thing you can carry forward from this feeling into your day.",
    ],
  },
  hypo: {
    color: "#FBBF24",
    label: "Hypo arousal",
    strategy: "Restore & Connect",
    words: ["Numb", "Withdrawn", "Flat", "Exhausted", "Disconnected", "Heavy", "Foggy"],
    description: "Low energy state — your system may be under-activated. Gentle movement or connection can help.",
    strategySteps: [
      "Name it gently: \"I feel low right now. This is okay. It will shift.\"",
      "Check your basics: Have you eaten, hydrated, slept enough?",
      "Reach toward one small warmth: sunlight, a warm drink, a familiar song.",
      "Connect with one person, even briefly. Low states lift in connection.",
    ],
  },
};

// ── Word carousel (mirrors ZOWCapture's WordCarousel) ────────────────────────
function WordCarousel({ zone }: { zone: "hyper" | "regulates" | "hypo" }) {
  const [idx, setIdx] = useState(0);
  const data = ZONE_DATA[zone];
  return (
    <div className="mt-3 p-3 rounded-2xl" style={{ background: `${data.color}11`, border: `1.5px solid ${data.color}33` }}>
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setIdx((i) => (i - 1 + data.words.length) % data.words.length)}
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${data.color}22` }}
        >
          <ChevronLeft className="w-3 h-3" style={{ color: data.color }} />
        </button>
        <div className="flex gap-2 flex-1 overflow-hidden justify-center">
          {[-1, 0, 1].map((offset) => {
            const wordIdx = (idx + offset + data.words.length) % data.words.length;
            const isCenter = offset === 0;
            return (
              <span
                key={offset}
                className="px-3 py-1 rounded-full text-xs transition-all flex-shrink-0"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: isCenter ? 700 : 400,
                  fontSize: isCenter ? "13px" : "11px",
                  background: isCenter ? data.color : `${data.color}22`,
                  color: isCenter ? "white" : data.color,
                  opacity: isCenter ? 1 : 0.6,
                }}
              >
                {data.words[wordIdx]}
              </span>
            );
          })}
        </div>
        <button
          onClick={() => setIdx((i) => (i + 1) % data.words.length)}
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${data.color}22` }}
        >
          <ChevronRight className="w-3 h-3" style={{ color: data.color }} />
        </button>
      </div>
      <p className="text-xs text-center leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", fontStyle: "italic" }}>
        {data.description}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ZERScreen({ onDone }: ZERScreenProps) {
  const [step, setStep] = useState<ZerStep>("locate");
  const [zerScore, setZerScore] = useState<number | null>(null);
  const [tapPos, setTapPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [strategyIdx, setStrategyIdx] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const zoneKey = zerScore !== null ? getZoneKey(zerScore) : null;
  const zone = zoneKey ? ZONE_DATA[zoneKey] : null;

  const getCurrentTimeX = () => {
    const now = new Date();
    return ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;
  };

  const handleCanvasTap = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const y = clientY - rect.top;
    const score = Math.max(1, Math.min(7, Math.ceil(((rect.height - y) / rect.height) * 7)));
    const xPct = getCurrentTimeX();
    const yPct = ((rect.height - y) / rect.height) * 100;
    setZerScore(score);
    setTapPos({ x: xPct, y: yPct });
    setSelectedEmotion(null);
  };

  const handleEmotion = (e: string) => {
    setSelectedEmotion(e);
    setStrategyIdx(0);
    setStep("strategy");
  };

  const handleStrategyNext = () => {
    if (zone && strategyIdx < zone.strategySteps.length - 1) setStrategyIdx((i) => i + 1);
    else setStep("done");
  };

  // ── Done ──────────────────────────────────────────────────────────────────
  if (step === "done" && zone && selectedEmotion && zerScore !== null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: DONE_BG }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: PURPLE }}>
          <Check className="w-10 h-10" style={{ color: "white" }} />
        </div>
        <h2 className="text-2xl mb-2 text-center" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
          Emotion regulated
        </h2>
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1.5 rounded-full text-sm" style={{ background: `${zone.color}22`, border: `1px solid ${zone.color}44`, fontFamily: "Inter, sans-serif", fontWeight: 600, color: zone.color }}>
            {selectedEmotion}
          </span>
          <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>ZER {zerScore}</span>
        </div>
        <p className="text-sm mb-10 text-center max-w-xs" style={{ fontFamily: "Inter, sans-serif", color: "#4C1D95", lineHeight: 1.6 }}>
          Naming and navigating your emotional state is a sign of emotional intelligence.
        </p>
        <button
          onClick={() => {
            setStep("locate");
            setZerScore(null);
            setTapPos(null);
            setSelectedEmotion(null);
          }}
          className="cb-btn-ghost mb-3"
        >
          Log another check-in
        </button>
        <button onClick={onDone} className="cb-btn-primary">Done</button>
      </div>
    );
  }

  // ── Strategy ──────────────────────────────────────────────────────────────
  if (step === "strategy" && zone && selectedEmotion) {
    const sStep = zone.strategySteps[strategyIdx];
    return (
      <div className="min-h-screen flex flex-col" style={{ background: PAGE_BG, padding: "16px" }}>
        <div className="flex items-center gap-3 pt-10 pb-4">
          <button onClick={() => setStep("emotion")} className="cb-btn-icon">
            <ArrowLeft className="w-5 h-5" style={{ color: "#15113C" }} />
          </button>
          <div>
            <h1 className="text-xl" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>{zone.strategy}</h1>
            <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
              Step {strategyIdx + 1} of {zone.strategySteps.length}
            </p>
          </div>
        </div>

        <div className="h-1.5 rounded-full mb-4" style={{ background: "#E5E7EB" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((strategyIdx + 1) / zone.strategySteps.length) * 100}%`, background: PURPLE }} />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs" style={{ background: `${zone.color}18`, color: zone.color, fontFamily: "Inter, sans-serif", fontWeight: 600, border: `1px solid ${zone.color}30` }}>
            {selectedEmotion}
          </span>
          <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>{zone.label}</span>
        </div>

        <div className="flex-1 p-6 rounded-3xl mb-4" style={{ background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(139,92,246,0.15)", boxShadow: "0 4px 20px rgba(139,92,246,0.08)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: PURPLE, color: "white", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "15px" }}>
            {strategyIdx + 1}
          </div>
          <p className="text-base" style={{ fontFamily: "Inter, sans-serif", color: "#15113C", lineHeight: 1.75 }}>{sStep}</p>
        </div>

        <button onClick={handleStrategyNext} className="cb-btn-primary">
          {strategyIdx < zone.strategySteps.length - 1 ? "Next" : "Complete"}
        </button>
      </div>
    );
  }

  // ── Emotion picker ─────────────────────────────────────────────────────────
  if (step === "emotion" && zone && zerScore !== null) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: PAGE_BG, padding: "16px" }}>
        <div className="flex items-center gap-3 pt-10 pb-6">
          <button onClick={() => setStep("locate")} className="cb-btn-icon">
            <ArrowLeft className="w-5 h-5" style={{ color: "#15113C" }} />
          </button>
          <div>
            <h1 className="text-xl" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>Name the emotion</h1>
            <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>{zone.label} · ZER {zerScore}</p>
          </div>
        </div>

        {/* Zone banner */}
        <div className="mb-4 px-4 py-2.5 rounded-2xl flex items-center gap-2" style={{ background: `${zone.color}11`, border: `1.5px solid ${zone.color}30` }}>
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: zone.color }} />
          <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: zone.color }}>{zone.label}</span>
          <span className="text-xs ml-auto" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>{zone.strategy}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {zone.words.map((word) => (
            <button
              key={word}
              onClick={() => handleEmotion(word)}
              className="py-4 px-3 rounded-2xl text-center cb-ripple-dark"
              style={{
                background: "rgba(255,255,255,0.88)",
                border: "1.5px solid rgba(139,92,246,0.15)",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                color: "#15113C",
              }}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Locate step — ZER arousal canvas ─────────────────────────────────────
  const timeX = getCurrentTimeX();
  const nowStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const nowLabel = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PAGE_BG, padding: "16px", paddingBottom: "40px" }}>
      {/* Header */}
      <div className="flex items-center gap-3 pt-10 pb-3">
        <button onClick={onDone} className="cb-btn-icon">
          <ArrowLeft className="w-5 h-5" style={{ color: "#15113C" }} />
        </button>
        <div>
          <h1 className="text-xl" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
            Zone of Emotional Regulation
          </h1>
          <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
            How are you feeling right now?
          </p>
        </div>
      </div>

      {/* Instruction */}
      <div className="mb-3 text-center">
        <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF", fontStyle: "italic" }}>
          Tap on the canvas at{" "}
          <span style={{ color: "#8B5CF6", fontWeight: 600, fontStyle: "normal" }}>{nowStr}</span>
        </p>
      </div>

      {/* TODAY label */}
      <div className="mb-1 ml-14">
        <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", fontWeight: 600, letterSpacing: "0.1em" }}>TODAY</span>
      </div>

      {/* Canvas row */}
      <div className="flex items-start">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between mr-2" style={{ height: "280px", paddingTop: "8px", paddingBottom: "8px" }}>
          {[
            { label: "Hyper", sub: "(6-7)", color: "#F97316" },
            { label: "",      sub: "",       color: "transparent" },
            { label: "Reg.",  sub: "(3-5)",  color: "#10B981" },
            { label: "",      sub: "",       color: "transparent" },
            { label: "Hypo",  sub: "(1-2)",  color: "#F97316" },
            { label: "",      sub: "",       color: "transparent" },
          ].map((item, i) => (
            <span
              key={i}
              className="text-right leading-tight"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, width: "40px", color: item.color }}
            >
              {item.label}
              {item.sub && (
                <span style={{ display: "block", fontSize: "8px", fontWeight: 400, color: "#9CA3AF" }}>{item.sub}</span>
              )}
            </span>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <div
            ref={canvasRef}
            onClick={handleCanvasTap}
            onTouchStart={handleCanvasTap}
            className="relative rounded-3xl cursor-pointer overflow-hidden"
            style={{
              height: "280px",
              background: "white",
              border: "2px solid #E5E7EB",
            }}
          >
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.4 }}>
              <line x1="0" y1="28.5%" x2="100%" y2="28.5%" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="0" y1="71.5%" x2="100%" y2="71.5%" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3,3" />
            </svg>

            {/* Current-time vertical line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 pointer-events-none"
              style={{
                left: `${timeX}%`,
                background: "linear-gradient(to bottom, transparent 0%, #8B5CF6 50%, transparent 100%)",
                opacity: 0.5,
              }}
            />

            {/* Tap dot */}
            {tapPos && (
              <div
                className="absolute w-6 h-6 rounded-full border-4 border-white shadow-lg animate-pulse"
                style={{
                  left: `${tapPos.x}%`,
                  top: `${100 - tapPos.y}%`,
                  transform: "translate(-50%, -50%)",
                  background: zerScore !== null ? getZERColor(zerScore) : "#8B5CF6",
                }}
              />
            )}

            {/* Tap hint */}
            {!tapPos && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="px-4 py-2.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(139,92,246,0.18)" }}>
                  <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>Tap to mark your state</p>
                </div>
              </div>
            )}
          </div>

          {/* X-axis time labels */}
          <div className="flex items-center justify-between mt-1.5">
            {["00:00", "06:00", "12:00", "18:00", "24:00"].map((t) => (
              <span key={t} className="text-xs text-center flex-1" style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", fontWeight: 600 }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Score card */}
      {tapPos && zerScore !== null && (
        <div className="p-3 rounded-3xl mt-3 mb-3" style={{ background: "white", border: "2px solid #E5E7EB" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: getZERColor(zerScore) }}
            >
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: "white", fontSize: "22px" }}>
                {zerScore}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs mb-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>Your ZER Score</p>
              <p className="text-sm mb-0.5" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
                Zone of Emotional Regulation
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: `${getZERColor(zerScore)}22`, color: getZERColor(zerScore), fontFamily: "Inter, sans-serif", fontWeight: 600 }}
                >
                  {getZERArousal(zerScore)}
                </span>
                <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", fontWeight: 600 }}>
                  {nowLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Word carousel */}
          <WordCarousel zone={getZoneKey(zerScore)} />
        </div>
      )}

      {/* Out-of-zone note */}
      {tapPos && zerScore !== null && isOutOfZone(zerScore) && (
        <div
          className="px-4 py-3 rounded-2xl mb-3"
          style={{ background: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)", border: "1.5px solid #C4B5FD" }}
        >
          <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#4C1D95", lineHeight: 1.6 }}>
            You are outside the regulation zone. The next step will help you navigate back.
          </p>
        </div>
      )}

      {/* CTA */}
      {tapPos && zerScore !== null && (
        <button onClick={() => setStep("emotion")} className="cb-btn-primary">
          Name the emotion
        </button>
      )}
    </div>
  );
}

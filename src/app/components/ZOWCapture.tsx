import { useState, useRef, type ComponentType } from "react";
import { ChevronLeft, ChevronRight, X, Zap, Wind, Droplets, Activity, Footprints, Droplet, HeartPulse, Waves } from "lucide-react";
import { ZEREmotionFlow, ZERFlowResult } from "./ZEREmotionFlow";
import { motion } from "motion/react";

interface SelectedEmotion { core: string; secondary: string; tertiary?: string; }

interface ZOWCaptureProps {
  userName: string;
  onComplete: (zerLevel: number, trigger?: string) => void;
}

interface TapPoint {
  x: number;
  y: number;
  score: number;
  color: string;
}

// ── ZER colour scale ──────────────────────────────────────────────────────────
export function getZERColor(score: number): string {
  if (score === 7) return "#F97316";
  if (score === 6) return "#F59E0B";
  if (score >= 3)  return "#10B981";
  if (score === 2) return "#FBBF24";
  return "#3B82F6";
}

export function getZERZone(_score: number): string {
  return "Zone of Emotional Regulation";
}

export function getZERArousal(score: number): string {
  if (score >= 6) return "Hyper arousal";
  if (score >= 3) return "Regulates";
  return "Hypo arousal";
}

function isOutOfZone(score: number): boolean {
  return score <= 2 || score >= 6;
}

// ── Carousel emotion words per zone ──────────────────────────────────────────
const ZONE_WORDS: Record<string, { words: string[]; description: string; color: string }> = {
  hyper: {
    color: "#F97316",
    words: ["Anxious", "Activated", "Alert", "Overwhelmed", "Reactive", "Tense", "Wired"],
    description: "High energy state — your nervous system is elevated. Use grounding or breath to regulate.",
  },
  regulates: {
    color: "#10B981",
    words: ["Calm", "Grounded", "Present", "Centered", "Settled", "Clear", "Balanced"],
    description: "You are in the window of tolerance — able to think, feel and respond with clarity.",
  },
  hypo: {
    color: "#3B82F6",
    words: ["Numb", "Withdrawn", "Flat", "Exhausted", "Disconnected", "Heavy", "Foggy"],
    description: "Low energy state — your system may be under-activated. Gentle movement or connection can help.",
  },
};

function getZoneKey(score: number): string {
  if (score >= 6) return "hyper";
  if (score >= 3) return "regulates";
  return "hypo";
}

function WordCarousel({ score }: { score: number }) {
  const [idx, setIdx] = useState(0);
  const zone = ZONE_WORDS[getZoneKey(score)];
  return (
    <div className="mt-3 p-3 rounded-2xl" style={{ background: `${zone.color}11`, border: `1.5px solid ${zone.color}33` }}>
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setIdx((i) => (i - 1 + zone.words.length) % zone.words.length)}
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${zone.color}22` }}
        >
          <ChevronLeft className="w-3 h-3" style={{ color: zone.color }} />
        </button>
        <div className="flex gap-2 flex-1 overflow-hidden justify-center">
          {[-1, 0, 1].map((offset) => {
            const wordIdx = (idx + offset + zone.words.length) % zone.words.length;
            const isCenter = offset === 0;
            return (
              <span
                key={offset}
                className="px-3 py-1 rounded-full text-xs transition-all flex-shrink-0"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: isCenter ? 700 : 400,
                  fontSize: isCenter ? "13px" : "11px",
                  background: isCenter ? zone.color : `${zone.color}22`,
                  color: isCenter ? "white" : zone.color,
                  opacity: isCenter ? 1 : 0.6,
                }}
              >
                {zone.words[wordIdx]}
              </span>
            );
          })}
        </div>
        <button
          onClick={() => setIdx((i) => (i + 1) % zone.words.length)}
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${zone.color}22` }}
        >
          <ChevronRight className="w-3 h-3" style={{ color: zone.color }} />
        </button>
      </div>
      <p className="text-xs text-center leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", fontStyle: "italic" }}>
        {zone.description}
      </p>
    </div>
  );
}

// ── Hyper: somatic downregulation interventions ───────────────────────────────
function HyperInterventionCard({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const items: { Icon: ComponentType<{ style?: React.CSSProperties }>; title: string; detail: string }[] = [
    { Icon: Wind,       title: "Five Finger Breathing", detail: "2 min · Trace each finger — breathe in up, out down" },
    { Icon: Droplets,   title: "Cold Water Splash", detail: "30 sec · Cold water on wrists or face to downregulate" },
    { Icon: Footprints, title: "10-min Walk", detail: "Step away and let your body process through movement" },
    { Icon: Activity,   title: "One Gentle Stretch", detail: "1 min · Arms up, neck rolls, roll your shoulders back" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-3xl mb-3"
      style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)", border: "1.5px solid #FDBA74" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F97316" }}>
          <Zap style={{ width: 15, height: 15, color: "white", strokeWidth: 1.75 }} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight" style={{ fontFamily: "Lora, serif", color: "#9A3412" }}>
            Your system is running hot
          </p>
          <p className="text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#C2410C" }}>
            Try one of these before continuing
          </p>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3 px-3 py-2.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.75)" }}>
            <item.Icon style={{ width: 16, height: 16, color: "#F97316", strokeWidth: 1.75, flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-xs font-semibold" style={{ fontFamily: "Inter, sans-serif", color: "#15113C" }}>{item.title}</p>
              <p className="text-xs mt-0.5 leading-snug" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onNext}
          className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
          style={{ background: "#F97316", color: "white", fontFamily: "Inter, sans-serif" }}
        >
          Done — continue →
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-2.5 rounded-2xl text-sm"
          style={{ background: "rgba(255,255,255,0.7)", color: "#C2410C", fontFamily: "Inter, sans-serif", border: "1.5px solid #FDBA74" }}
        >
          Skip for now
        </button>
      </div>
    </motion.div>
  );
}

// ── Hypo: restorative low-friction prompts ────────────────────────────────────
function HypoInterventionCard({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const items: { Icon: ComponentType<{ style?: React.CSSProperties }>; title: string; detail: string }[] = [
    { Icon: Droplet,    title: "Just One Sip", detail: "Drink a full glass of water right now — small acts matter" },
    { Icon: Footprints, title: "Two Minutes Micro Walk", detail: "Just get up and move, even to the next room" },
    { Icon: HeartPulse, title: "Check Your Basics", detail: "Have you eaten? Had enough sleep? Hydrated today?" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-3xl mb-3"
      style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", border: "1.5px solid #93C5FD" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#3B82F6" }}>
          <Waves style={{ width: 15, height: 15, color: "white", strokeWidth: 1.75 }} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight" style={{ fontFamily: "Lora, serif", color: "#1E40AF" }}>
            Your energy is low right now
          </p>
          <p className="text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#1D4ED8" }}>
            Small things first — any one of these helps
          </p>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3 px-3 py-2.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.75)" }}>
            <item.Icon style={{ width: 16, height: 16, color: "#3B82F6", strokeWidth: 1.75, flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-xs font-semibold" style={{ fontFamily: "Inter, sans-serif", color: "#15113C" }}>{item.title}</p>
              <p className="text-xs mt-0.5 leading-snug" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onNext}
          className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
          style={{ background: "#3B82F6", color: "white", fontFamily: "Inter, sans-serif" }}
        >
          Done — continue →
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-2.5 rounded-2xl text-sm"
          style={{ background: "rgba(255,255,255,0.7)", color: "#1D4ED8", fontFamily: "Inter, sans-serif", border: "1.5px solid #93C5FD" }}
        >
          Skip for now
        </button>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ZOWCapture({ userName, onComplete }: ZOWCaptureProps) {
  const [tapPoint, setTapPoint]             = useState<TapPoint | null>(null);
  const [outOfZonePhase, setOutOfZonePhase] = useState<"intervention" | "emotion" | null>(null);
  const [showZERFlow, setShowZERFlow]       = useState(false);
  const [namedEmotion, setNamedEmotion]     = useState<SelectedEmotion | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const getScoreFromPosition = (y: number, h: number) =>
    Math.max(1, Math.min(7, Math.ceil(((h - y) / h) * 7)));

  const getCurrentTimePosition = () => {
    const now = new Date();
    return ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;
  };

  const handleCanvasTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const y = clientY - rect.top;
    const score = getScoreFromPosition(y, rect.height);
    setTapPoint({ x: getCurrentTimePosition(), y: ((rect.height - y) / rect.height) * 100, score, color: getZERColor(score) });
    setNamedEmotion(null);
    setOutOfZonePhase(null);
    setShowZERFlow(false);
  };

  const handleSubmit = () => {
    if (!tapPoint) return;
    // First time submitting out-of-zone → show micro-intervention
    if (isOutOfZone(tapPoint.score) && !outOfZonePhase && !namedEmotion) {
      setOutOfZonePhase("intervention");
      return;
    }
    const trigger = namedEmotion
      ? `${namedEmotion.core} — ${namedEmotion.secondary}${namedEmotion.tertiary ? ` (${namedEmotion.tertiary})` : ""}`
      : undefined;
    onComplete(tapPoint.score, trigger);
  };

  const handleInterventionNext = () => setOutOfZonePhase("emotion");
  const handleInterventionSkip = () => setOutOfZonePhase("emotion");

  const handleZERFlowComplete = (result: ZERFlowResult) => {
    setNamedEmotion({ core: result.words[0] || result.own[0] || "Unnamed", secondary: result.summary });
    setShowZERFlow(false);
    setOutOfZonePhase(null);
  };

  const triggerLabel = namedEmotion
    ? `${namedEmotion.core} — ${namedEmotion.secondary}${namedEmotion.tertiary ? ` · ${namedEmotion.tertiary}` : ""}`
    : null;

  const isHyper = tapPoint ? tapPoint.score >= 6 : false;
  const showInterventionCard  = tapPoint && isOutOfZone(tapPoint.score) && outOfZonePhase === "intervention" && !namedEmotion;
  const showEmotionPrompt     = tapPoint && isOutOfZone(tapPoint.score) && outOfZonePhase === "emotion" && !namedEmotion;
  const showContinueButton    = !showZERFlow && !showInterventionCard && !showEmotionPrompt;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-2xl mx-auto py-4">

          {/* Question */}
          <div className="mb-4 text-center">
            <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
              Welcome back, {userName}
            </h2>
            <p className="text-sm mb-1" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>
              How are you feeling today?
            </p>
            <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF", fontStyle: "italic" }}>
              Tap on the canvas at{" "}
              <span style={{ color: "#8B5CF6", fontWeight: 600 }}>
                {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
              </span>
            </p>
          </div>

          {/* Arousal info strip */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 px-3 py-2 rounded-2xl flex items-start gap-2" style={{ background: "#FFF7ED", border: "1.5px solid #FED7AA" }}>
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#F97316" }} />
              <div>
                <p className="text-xs font-semibold leading-tight" style={{ fontFamily: "Inter, sans-serif", color: "#C2410C" }}>Hyper-arousal</p>
                <p className="text-xs leading-snug mt-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#92400E", opacity: 0.8 }}>Over-activated — anxious, wired, overwhelmed</p>
              </div>
            </div>
            <div className="flex-1 px-3 py-2 rounded-2xl flex items-start gap-2" style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE" }}>
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#3B82F6" }} />
              <div>
                <p className="text-xs font-semibold leading-tight" style={{ fontFamily: "Inter, sans-serif", color: "#1E40AF" }}>Hypo-arousal</p>
                <p className="text-xs leading-snug mt-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#1D4ED8", opacity: 0.8 }}>Under-activated — numb, foggy, withdrawn</p>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="mb-3">
            <div className="mb-2 ml-14">
              <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", fontWeight: 600, letterSpacing: "0.1em" }}>TODAY</span>
            </div>
            <div className="flex items-start">
              {/* Y-axis */}
              <div className="flex flex-col justify-between mr-2" style={{ height: "300px", paddingTop: "8px", paddingBottom: "8px" }}>
                {[
                  { label: "Hyper", sub: "(6-7)", color: "#F97316" },
                  { label: "",      sub: "",       color: "transparent" },
                  { label: "Reg.",  sub: "(3-5)",  color: "#10B981" },
                  { label: "",      sub: "",       color: "transparent" },
                  { label: "Hypo",  sub: "(1-2)",  color: "#3B82F6" },
                  { label: "",      sub: "",       color: "transparent" },
                ].map((item, i) => (
                  <span key={i} className="text-right leading-tight" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, width: "42px", color: item.color }}>
                    {item.label}
                    {item.sub && <span style={{ display: "block", fontSize: "8px", fontWeight: 400, color: "#9CA3AF" }}>{item.sub}</span>}
                  </span>
                ))}
              </div>

              <div className="flex-1">
                <div
                  ref={canvasRef}
                  onClick={handleCanvasTap}
                  onTouchStart={handleCanvasTap}
                  className="relative rounded-3xl cursor-pointer border-2 overflow-hidden"
                  style={{ height: "300px", background: "white", borderColor: "#E5E7EB" }}
                >
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.4 }}>
                    <line x1="0" y1="28.5%" x2="100%" y2="28.5%" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4,4" />
                    <line x1="0" y1="71.5%" x2="100%" y2="71.5%" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4,4" />
                    <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3,3" />
                  </svg>
                  <div className="absolute top-0 bottom-0 w-0.5 pointer-events-none" style={{ left: `${getCurrentTimePosition()}%`, background: "linear-gradient(to bottom, transparent 0%, #8B5CF6 50%, transparent 100%)", opacity: 0.4 }} />
                  {tapPoint && (
                    <div
                      className="absolute w-6 h-6 rounded-full border-4 border-white shadow-lg animate-pulse"
                      style={{ left: `${tapPoint.x}%`, top: `${100 - tapPoint.y}%`, transform: "translate(-50%, -50%)", background: tapPoint.color }}
                    />
                  )}
                  {!tapPoint && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="px-4 py-2.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.9)", border: "1.5px solid #E5E7EB" }}>
                        <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>Tap to mark your state</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  {["00:00", "06:00", "12:00", "18:00", "24:00"].map((t) => (
                    <span key={t} className="text-xs text-center flex-1" style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Score card */}
          {tapPoint && (
            <div className="p-3 rounded-3xl mb-3" style={{ background: "white", border: "2px solid #E5E7EB" }}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tapPoint.color }}>
                  <span className="text-2xl" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: "white" }}>{tapPoint.score}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs mb-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>Your ZER Score</p>
                  <p className="text-sm mb-0.5" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>{getZERZone(tapPoint.score)}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${tapPoint.color}22`, color: tapPoint.color, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
                      {getZERArousal(tapPoint.score)}
                    </span>
                    <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", fontWeight: 600 }}>
                      {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </p>
                  </div>
                </div>
              </div>
              <WordCarousel score={tapPoint.score} />

              {namedEmotion && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background: "#EDE9FE", border: "1.5px solid #C4B5FD" }}>
                  <span className="text-xs flex-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#6D28D9" }}>
                    {triggerLabel}
                  </span>
                  <button onClick={() => setNamedEmotion(null)}>
                    <X className="w-3 h-3" style={{ color: "#8B5CF6" }} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Zone-specific micro-intervention cards */}
          {showInterventionCard && (
            isHyper
              ? <HyperInterventionCard onNext={handleInterventionNext} onSkip={handleInterventionSkip} />
              : <HypoInterventionCard  onNext={handleInterventionNext} onSkip={handleInterventionSkip} />
          )}

          {/* Emotion wheel prompt — shown after intervention */}
          {showEmotionPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-3xl mb-3"
              style={{ background: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)", border: "1.5px solid #C4B5FD" }}
            >
              <p className="text-sm mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
                Would you like to name what you feel?
              </p>
              <p className="text-xs mb-3" style={{ fontFamily: "Inter, sans-serif", color: "#4C1D95", lineHeight: 1.6 }}>
                Naming emotions helps you move through them. This takes about two minutes.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowZERFlow(true)}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
                  style={{ background: "#8B5CF6", color: "white", fontFamily: "Inter, sans-serif" }}
                >
                  Name what I feel →
                </button>
                <button
                  onClick={() => { setOutOfZonePhase(null); onComplete(tapPoint!.score); }}
                  className="flex-1 py-2.5 rounded-2xl text-sm"
                  style={{ background: "rgba(255,255,255,0.7)", color: "#6D28D9", fontFamily: "Inter, sans-serif", fontWeight: 500, border: "1.5px solid #C4B5FD" }}
                >
                  Continue anyway
                </button>
              </div>
            </motion.div>
          )}

          <div className="pb-4" />
        </div>
      </div>

      {/* ZER Emotion Flow overlay */}
      {showZERFlow && tapPoint && (
        <ZEREmotionFlow
          initialZone={tapPoint.score >= 6 ? "hi" : "lo"}
          onComplete={handleZERFlowComplete}
          onClose={() => setShowZERFlow(false)}
        />
      )}

      {/* Continue button — hidden when card/flow is active */}
      {showContinueButton && (
        <div
          className="flex-shrink-0 px-4 py-3"
          style={{ background: "white", borderTop: "1px solid rgba(229,231,235,0.5)" }}
        >
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleSubmit}
              disabled={!tapPoint}
              className="w-full py-3 rounded-full transition-all disabled:opacity-40"
              style={{
                background: tapPoint ? "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)" : "#E5E7EB",
                color: "white",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "15px",
              }}
            >
              {namedEmotion ? "Save & continue" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

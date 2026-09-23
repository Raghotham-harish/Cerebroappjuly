import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Check, Mic, MicOff, Heart, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ─── TTS ────────────────────────────────────────────────────────────── */
function speakText(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.62; utt.pitch = 1.0; utt.volume = 1;
  // Prefer a calm female voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.name.includes("Samantha") || v.name.includes("Karen") ||
    v.name.includes("Moira") || v.name.includes("Tessa") ||
    v.name.includes("Google US English Female")
  ) ?? voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
    ?? voices.find(v => v.lang.startsWith("en"));
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
}

/* ─── Nurturing voice scripts — spoken aloud ─────────────────────────── */
const voiceScript: Record<string, Record<string, string>> = {
  "478": {
    Inhale: "Gently breathe in through your nose… let calm fill you…",
    Hold:   "Hold softly… feel the stillness… you are safe…",
    Exhale: "Slowly breathe all the way out… releasing every tension…",
  },
  "box": {
    Inhale: "Breathe in steadily… building your centre…",
    Hold:   "Hold gently… grounded and still…",
    Exhale: "Release completely… smooth and slow…",
  },
  "coherence": {
    Inhale: "Breathe in slowly through your nose… smooth and even…",
    Exhale: "Breathe out gently… at the same steady pace…",
  },
};

/* ─── On-screen guidance text (shorter) ─────────────────────────────── */
const guideText: Record<string, Record<string, string>> = {
  "478": {
    Inhale: "Let calm fill you",
    Hold:   "Feel the stillness within",
    Exhale: "Release every tension",
  },
  "box": {
    Inhale: "Build your centre",
    Hold:   "Grounded and still",
    Exhale: "Smooth and slow",
  },
  "coherence": {
    Inhale: "Smooth and even, through the nose",
    Exhale: "At the same steady pace",
  },
};

/* ─── Ambient audio per pattern ──────────────────────────────────────── */
function useBreathAmbient(patternId: string | null, active: boolean) {
  const audioRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    audioRef.current?.stop();
    audioRef.current = null;
    if (!active || !patternId) return;

    try {
      // @ts-ignore
      const ctx = new (window.AudioContext || window.webkitAudioContext)() as AudioContext;

      // Frequencies tuned per exercise:
      // 4-7-8  → 174.6 Hz (F3, Solfeggio "UT") — deep calm, stress release
      // Box    → 256 Hz (C4) — grounding, focus
      // Coher. → 136.1 Hz (C#3, OM frequency) — heart coherence, HRV
      const freqMap: Record<string, [number, number, number]> = {
        "478":       [174.6, 261.9, 130.8],
        "box":       [256.0, 384.0, 192.0],
        "coherence": [136.1, 204.2, 102.1],
      };
      const [f1, f2, f3] = freqMap[patternId] ?? [174.6, 261.9, 130.8];

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.048, ctx.currentTime + 3.5);
      master.connect(ctx.destination);

      const makeOsc = (freq: number, vol: number, type: OscillatorType = "sine") => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.value = vol;
        osc.connect(g);
        g.connect(master);
        osc.start();
        return osc;
      };

      const osc1 = makeOsc(f1, 1.0);
      const osc2 = makeOsc(f2, 0.18);
      const osc3 = makeOsc(f3, 0.10);

      // Ultra-slow LFO — breathing like movement in the sound
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.06;
      lfoGain.gain.value = 0.014;
      lfo.connect(lfoGain);
      lfoGain.connect(master.gain);
      lfo.start();

      const stop = () => {
        try {
          master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
          setTimeout(() => {
            [osc1, osc2, osc3, lfo].forEach(o => { try { o.stop(); } catch {} });
            ctx.close();
          }, 1400);
        } catch {}
      };

      audioRef.current = { stop };
    } catch (e) {
      console.warn("Breath ambient audio unavailable:", e);
    }

    return () => { audioRef.current?.stop(); audioRef.current = null; };
  }, [patternId, active]);
}

/* ─── Pattern data ───────────────────────────────────────────────────── */
interface BreathLoopsScreenProps { onDone: () => void; }

const patterns = [
  {
    id: "478" as const,
    name: "4-7-8",
    subtitle: "Calming & sleep-inducing",
    benefit: "Quiets the nervous system. Best before bed.",
    phases: [
      { label: "Inhale", duration: 4 },
      { label: "Hold",   duration: 7 },
      { label: "Exhale", duration: 8 },
    ],
    cardGradient: "linear-gradient(135deg, #DBEAFE 0%, #EDE9FE 100%)",
    accentColor: "#3B82F6",
    ambientColor: "rgba(59,130,246,0.14)",
  },
  {
    id: "box" as const,
    name: "Box Breathing",
    subtitle: "Focus & stress relief",
    benefit: "Used by Navy SEALs. Regulates breath under pressure.",
    phases: [
      { label: "Inhale", duration: 4 },
      { label: "Hold",   duration: 4 },
      { label: "Exhale", duration: 4 },
      { label: "Hold",   duration: 4 },
    ],
    cardGradient: "linear-gradient(135deg, #D1FAE5 0%, #DBEAFE 100%)",
    accentColor: "#059669",
    ambientColor: "rgba(5,150,105,0.14)",
  },
  {
    id: "coherence" as const,
    name: "Coherence",
    subtitle: "Heart-rate balance",
    benefit: "Synchronises heart and breath. Builds emotional regulation.",
    phases: [
      { label: "Inhale", duration: 5 },
      { label: "Exhale", duration: 5 },
    ],
    cardGradient: "linear-gradient(135deg, #FCE7F3 0%, #EDE9FE 100%)",
    accentColor: "#DB2777",
    ambientColor: "rgba(219,39,119,0.10)",
  },
];

type Pattern = typeof patterns[number];
const TOTAL_ROUNDS = 4;

/* ─── Visuals ────────────────────────────────────────────────────────── */

function OrbBreathVisual({ label, progress }: { label: string; progress: number }) {
  const scale =
    label === "Inhale" ? 0.52 + progress * 0.48
    : label === "Hold"  ? 1.0
    : 1.0 - progress * 0.48;
  const isHold = label === "Hold";
  const col  = label === "Inhale" ? "#3B82F6" : label === "Hold" ? "#8B5CF6" : "#818CF8";
  const glow = label === "Inhale" ? "rgba(59,130,246,0.35)" : label === "Hold" ? "rgba(139,92,246,0.4)" : "rgba(129,140,248,0.25)";
  const R = 90, r = R * scale;
  return (
    <div style={{ position: "relative", width: 240, height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: Math.min(r * 3.2, 235), height: Math.min(r * 3.2, 235), borderRadius: "50%", background: glow.replace(/0\.\d+\)/, "0.07)") }} />
      <div style={{ position: "absolute", width: Math.min(r * 2.3, 220), height: Math.min(r * 2.3, 220), borderRadius: "50%", background: glow.replace(/0\.\d+\)/, "0.14)") }} />
      <motion.div
        animate={isHold ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={isHold ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        style={{ position: "absolute", width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle at 38% 34%, ${col}AA, ${col})`, boxShadow: `0 0 ${r * 0.75}px ${glow}, 0 0 ${r * 0.35}px ${col}55`, zIndex: 5 }}
      />
    </div>
  );
}

function BoxBreathVisual({ phaseIdx, progress }: { phaseIdx: number; progress: number }) {
  const H = 74, phase = phaseIdx % 4;
  let dotX: number, dotY: number;
  switch (phase) {
    case 0: dotX = -H + progress * H * 2; dotY = -H; break;
    case 1: dotX = H; dotY = -H + progress * H * 2; break;
    case 2: dotX = H - progress * H * 2; dotY = H; break;
    default: dotX = -H; dotY = H - progress * H * 2; break;
  }
  const sideLen = H * 2;
  const sideProps = (idx: number) => {
    const isCurrent = idx === phase, isDone = idx < phase;
    return {
      stroke: isCurrent || isDone ? (idx % 2 === 0 ? "#34D399" : "#60A5FA") : "rgba(200,240,220,0.4)",
      strokeWidth: isCurrent || isDone ? 4.5 : 2,
      strokeDasharray: sideLen,
      strokeDashoffset: isDone ? 0 : isCurrent ? sideLen * (1 - progress) : sideLen,
    };
  };
  const lFill = (i: number) => i === phase ? (i % 2 === 0 ? "#065F46" : "#1E40AF") : "#9CA3AF";
  const lWeight = (i: number): number => i === phase ? 700 : 400;
  const dotColor = phase % 2 === 0 ? "#34D399" : "#60A5FA";
  return (
    <div style={{ width: 240, height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={226} height={226} viewBox="-113 -113 226 226">
        <defs><filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        <rect x={-H} y={-H} width={H*2} height={H*2} fill="none" stroke="rgba(209,250,229,0.2)" strokeWidth={1} rx={3}/>
        <line x1={-H} y1={-H} x2={H} y2={-H} strokeLinecap="round" {...sideProps(0)}/>
        <line x1={H} y1={-H} x2={H} y2={H} strokeLinecap="round" {...sideProps(1)}/>
        <line x1={H} y1={H} x2={-H} y2={H} strokeLinecap="round" {...sideProps(2)}/>
        <line x1={-H} y1={H} x2={-H} y2={-H} strokeLinecap="round" {...sideProps(3)}/>
        {([-H, H] as number[]).flatMap(x => ([-H, H] as number[]).map(y => <circle key={`${x}${y}`} cx={x} cy={y} r={4.5} fill="white" opacity={0.6}/>))}
        <text x={0} y={-H-18} textAnchor="middle" fill={lFill(0)} fontSize={10} fontFamily="Inter,sans-serif" fontWeight={lWeight(0)}>INHALE</text>
        <text x={H+28} y={4} textAnchor="middle" dominantBaseline="middle" fill={lFill(1)} fontSize={10} fontFamily="Inter,sans-serif" fontWeight={lWeight(1)}>HOLD</text>
        <text x={0} y={H+26} textAnchor="middle" fill={lFill(2)} fontSize={10} fontFamily="Inter,sans-serif" fontWeight={lWeight(2)}>EXHALE</text>
        <text x={-H-28} y={4} textAnchor="middle" dominantBaseline="middle" fill={lFill(3)} fontSize={10} fontFamily="Inter,sans-serif" fontWeight={lWeight(3)}>HOLD</text>
        <circle cx={dotX} cy={dotY} r={16} fill={dotColor} opacity={0.22} filter="url(#dotGlow)"/>
        <circle cx={dotX} cy={dotY} r={10} fill={dotColor} filter="url(#dotGlow)"/>
        <circle cx={dotX} cy={dotY} r={5} fill="white" opacity={0.92}/>
      </svg>
    </div>
  );
}

function CoherenceBreathVisual({ label, progress }: { label: string; progress: number }) {
  const isInhale = label === "Inhale";
  const lScale = isInhale ? 0.44 + progress * 0.56 : 1.0 - progress * 0.56;
  const lungW = lScale * 62, lungH = 38 + lScale * 52, gap = 5 + lScale * 8;
  const wavePhase = isInhale ? progress * Math.PI : Math.PI + progress * Math.PI;
  const wPts = Array.from({ length: 101 }, (_, i) => {
    const x = (i / 100) * 220;
    const y = 22 + Math.sin((i / 100) * Math.PI * 2 - wavePhase + Math.PI) * 17;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: `${gap}px`, height: 120 }}>
        <div style={{ width: lungW, height: lungH, flexShrink: 0, borderRadius: "50% 50% 68% 32% / 60% 38% 70% 42%", background: "linear-gradient(160deg, #FDA4AF 0%, #F43F5E 100%)", opacity: 0.82, boxShadow: "0 4px 18px rgba(244,63,94,0.32)" }}/>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
          <div style={{ width: 7, height: 20, borderRadius: 4, background: "rgba(219,39,119,0.32)" }}/>
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}>
            <Heart style={{ width: 22, height: 22, color: "#DB2777", fill: "#DB2777", strokeWidth: 0 }}/>
          </motion.div>
        </div>
        <div style={{ width: lungW, height: lungH, flexShrink: 0, borderRadius: "50% 50% 32% 68% / 60% 38% 70% 42%", background: "linear-gradient(160deg, #C084FC 0%, #9333EA 100%)", opacity: 0.82, boxShadow: "0 4px 18px rgba(147,51,234,0.32)" }}/>
      </div>
      <svg width={220} height={44} style={{ overflow: "visible" }}>
        <defs><linearGradient id="coherGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#F9A8D4" stopOpacity="0.2"/><stop offset="40%" stopColor="#DB2777" stopOpacity="0.9"/><stop offset="60%" stopColor="#9333EA" stopOpacity="0.9"/><stop offset="100%" stopColor="#C084FC" stopOpacity="0.2"/></linearGradient></defs>
        <polyline points={wPts} fill="none" stroke="url(#coherGrad)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#DB2777" }}>
        {isInhale ? "HRV ↑  COHERENCE RISING" : "HRV ↓  COHERENT RHYTHM"}
      </p>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export function BreathLoopsScreen({ onDone }: BreathLoopsScreenProps) {
  const [selected, setSelected]   = useState<Pattern | null>(null);
  const [phaseIdx, setPhaseIdx]   = useState(0);
  const [progress, setProgress]   = useState(0);
  const [count, setCount]         = useState(0);
  const [round, setRound]         = useState(1);
  const [running, setRunning]     = useState(false);
  const [completed, setCompleted] = useState(false);
  const [voiceOn, setVoiceOn]     = useState(true);   // voice narration — default ON
  const [soundOn, setSoundOn]     = useState(true);   // ambient drone  — default ON

  const roundRef = useRef(1);
  const voiceRef = useRef(true);
  voiceRef.current = voiceOn;

  // Ambient binaural drone — starts with session
  useBreathAmbient(running && selected ? selected.id : null, soundOn);

  // 60fps phase animation loop
  useEffect(() => {
    if (!running || !selected) return;
    const phase = selected.phases[phaseIdx];
    const dur   = phase.duration * 1000;
    const start = Date.now();

    setCount(phase.duration);
    setProgress(0);

    if (voiceRef.current) {
      const script = voiceScript[selected.id]?.[phase.label] ?? phase.label;
      speakText(script);
    }

    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const prog = Math.min(elapsed / dur, 1);
      setProgress(prog);
      setCount(Math.max(Math.ceil((dur - elapsed) / 1000), 0));

      if (elapsed >= dur) {
        clearInterval(tick);
        const nextIdx = (phaseIdx + 1) % selected.phases.length;
        if (nextIdx === 0) {
          if (roundRef.current >= TOTAL_ROUNDS) {
            setRunning(false);
            setCompleted(true);
            window.speechSynthesis?.cancel();
            return;
          }
          roundRef.current += 1;
          setRound(roundRef.current);
        }
        setPhaseIdx(nextIdx);
      }
    }, 16);

    return () => clearInterval(tick);
  }, [running, phaseIdx, selected]);

  const begin = (p: Pattern) => {
    roundRef.current = 1;
    setSelected(p); setPhaseIdx(0); setRound(1);
    setProgress(0); setCompleted(false); setRunning(true);
  };

  const stop = () => {
    setRunning(false); setSelected(null);
    window.speechSynthesis?.cancel();
  };

  const toggleVoice = () => {
    if (voiceOn) { window.speechSynthesis?.cancel(); setVoiceOn(false); }
    else setVoiceOn(true);
  };

  const phase = selected?.phases[phaseIdx];

  /* ── Completion ── */
  if (completed && selected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 100%)" }}>
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: "#8B5CF6" }}>
          <Check className="w-12 h-12" style={{ color: "white" }} />
        </motion.div>
        <h2 className="text-2xl mb-2 text-center"
          style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
          Session Complete
        </h2>
        <p className="text-sm mb-2 text-center"
          style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>
          {TOTAL_ROUNDS} rounds of {selected.name} breathing
        </p>
        <p className="text-sm mb-10 text-center italic"
          style={{ fontFamily: "Lora, serif", color: "#7C3AED", lineHeight: 1.6 }}>
          "Notice how you feel right now. This calm is yours."
        </p>
        <button onClick={onDone} style={{
          width: "100%", maxWidth: 240, padding: "14px 0", borderRadius: 999,
          background: "#8B5CF6", color: "white", border: "none",
          fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer",
        }}>
          Done
        </button>
      </div>
    );
  }

  /* ── Active session ── */
  if (running && selected && phase) {
    const sessionBg = `linear-gradient(180deg, ${selected.ambientColor.replace("0.14", "0.06").replace("0.10", "0.05")} 0%, #F5F3FF 100%)`;
    const guidance  = guideText[selected.id]?.[phase.label] ?? "";

    return (
      <div className="min-h-screen flex flex-col" style={{ background: sessionBg, padding: "0 16px" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 48, paddingBottom: 8 }}>
          {/* Back */}
          <button onClick={stop} className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.72)", border: "1.5px solid rgba(0,0,0,0.08)", flexShrink: 0 }}>
            <ArrowLeft className="w-5 h-5" style={{ color: "#15113C" }} />
          </button>

          {/* Round indicator */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#8B5CF6", fontWeight: 700, letterSpacing: "0.09em" }}>ROUND</p>
            <p style={{ fontFamily: "Lora, serif", fontSize: 19, color: "#15113C", fontWeight: 500 }}>{round} / {TOTAL_ROUNDS}</p>
          </div>

          {/* Sound + Voice toggles */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => setSoundOn(v => !v)}
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: soundOn ? "#EDE9FE" : "rgba(255,255,255,0.72)", border: `1.5px solid ${soundOn ? "#C4B5FD" : "rgba(0,0,0,0.08)"}` }}
              title={soundOn ? "Mute ambient" : "Play ambient"}>
              {soundOn
                ? <Volume2 className="w-4 h-4" style={{ color: "#8B5CF6" }} />
                : <VolumeX className="w-4 h-4" style={{ color: "#9CA3AF" }} />}
            </button>
            <button onClick={toggleVoice}
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: voiceOn ? "#EDE9FE" : "rgba(255,255,255,0.72)", border: `1.5px solid ${voiceOn ? "#C4B5FD" : "rgba(0,0,0,0.08)"}` }}
              title={voiceOn ? "Mute guidance" : "Voice guidance"}>
              {voiceOn
                ? <Mic className="w-4 h-4" style={{ color: "#8B5CF6" }} />
                : <MicOff className="w-4 h-4" style={{ color: "#9CA3AF" }} />}
            </button>
          </div>
        </div>

        {/* Ambient/voice status pill */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 999,
            background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.14)",
          }}>
            {soundOn && <Volume2 style={{ width: 11, height: 11, color: "#8B5CF6" }} />}
            {voiceOn && <Mic style={{ width: 11, height: 11, color: "#8B5CF6" }} />}
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#7C3AED", fontWeight: 600 }}>
              {soundOn && voiceOn ? "Ambient + Voice" : soundOn ? "Ambient" : voiceOn ? "Voice guidance" : "Silent"}
            </span>
          </div>
        </div>

        {/* Visual */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AnimatePresence mode="wait">
            <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {selected.id === "478"       && <OrbBreathVisual label={phase.label} progress={progress} />}
              {selected.id === "box"       && <BoxBreathVisual phaseIdx={phaseIdx} progress={progress} />}
              {selected.id === "coherence" && <CoherenceBreathVisual label={phase.label} progress={progress} />}
            </motion.div>
          </AnimatePresence>

          {/* Phase label + guidance + count */}
          <div style={{ textAlign: "center", maxWidth: 280 }}>
            <AnimatePresence mode="wait">
              <motion.div key={phase.label + phaseIdx}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <h2 style={{ fontFamily: "Lora, serif", fontSize: 30, fontWeight: 500, color: "#15113C", marginBottom: 4 }}>
                  {phase.label}
                </h2>
                {guidance && (
                  <p style={{ fontFamily: "Lora, serif", fontStyle: "italic", fontSize: 14, color: "#7C3AED", lineHeight: 1.55, marginBottom: 12, opacity: 0.85 }}>
                    {guidance}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Countdown circle */}
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(255,255,255,0.85)",
              border: "2px solid rgba(139,92,246,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 6px",
              boxShadow: "0 2px 14px rgba(139,92,246,0.13)",
            }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 26, fontWeight: 700, color: "#15113C" }}>{count}</span>
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#9CA3AF" }}>{selected.name}</p>
          </div>
        </div>

        <button onClick={stop} style={{
          margin: "0 0 36px", padding: "14px 0", borderRadius: 999,
          background: "rgba(255,255,255,0.52)",
          border: "1.5px solid rgba(139,92,246,0.18)",
          color: "#6B7280", fontFamily: "Inter, sans-serif",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>
          Stop session
        </button>
      </div>
    );
  }

  /* ── Pattern selection ── */
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)", padding: "16px 16px 40px" }}>
      <div className="flex items-center gap-3 pt-10 pb-4">
        <button onClick={onDone} className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.72)", border: "1.5px solid rgba(0,0,0,0.08)", flexShrink: 0 }}>
          <ArrowLeft className="w-5 h-5" style={{ color: "#15113C" }} />
        </button>
        <div>
          <h1 style={{ fontFamily: "Lora, serif", fontSize: 24, fontWeight: 500, color: "#15113C" }}>Breath Loops</h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#9CA3AF" }}>Choose a breathing pattern</p>
        </div>
      </div>

      {/* Feature pill */}
      <div style={{
        background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.16)",
        borderRadius: 14, padding: "9px 14px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Volume2 style={{ width: 14, height: 14, color: "#8B5CF6", flexShrink: 0 }} />
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#6D28D9", margin: 0, lineHeight: 1.4 }}>
          Each session includes a healing ambient drone + gentle voice guidance — both adjustable during the session.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {patterns.map((p) => (
          <motion.button key={p.id} onClick={() => begin(p)} whileTap={{ scale: 0.97 }}
            style={{ width: "100%", borderRadius: 24, border: "none", background: p.cardGradient, padding: "20px", textAlign: "left", cursor: "pointer", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: p.ambientColor, top: -30, right: -20 }} />
            <div style={{ position: "relative" }}>
              <p style={{ fontFamily: "Lora, serif", fontSize: 20, fontWeight: 500, color: "#15113C", marginBottom: 2 }}>{p.name}</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#6B7280", marginBottom: 8 }}>{p.subtitle}</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#374151", lineHeight: 1.55, marginBottom: 12 }}>{p.benefit}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {p.phases.map((ph, i) => (
                  <span key={i} style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, background: "rgba(255,255,255,0.68)", color: "#15113C", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
                    {ph.label} {ph.duration}s
                  </span>
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Check, Moon, Smartphone, Lightbulb, Thermometer,
  Coffee, NotebookPen, Volume2, VolumeX, Waves, Plus, X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ─── Ambient sleep audio ─────────────────────────────────────────────── */
function useSleepAmbient(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
      return;
    }
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 5);
    master.connect(ctx.destination);

    // Delta binaural: 174.6 Hz + 177.2 Hz (2.6 Hz difference = delta brainwaves) + subharmonic
    [174.6, 177.2, 87.3].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.value = i === 2 ? 0.25 : 0.4;

      lfo.type = "sine";
      lfo.frequency.value = 0.025 + i * 0.007;
      lfoG.gain.value = 0.008;
      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);

      osc.connect(g);
      g.connect(master);
      lfo.start();
      osc.start();
    });

    return () => {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.8);
      setTimeout(() => ctx.close().catch(() => {}), 2000);
      ctxRef.current = null;
    };
  }, [enabled]);
}

/* ─── TTS helper ─────────────────────────────────────────────────────── */
function speak(text: string, rate = 0.78) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = rate; utt.pitch = 0.95; utt.volume = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(v => v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Moira"))
    ?? voices.find(v => v.lang.startsWith("en"));
  if (v) utt.voice = v;
  window.speechSynthesis.speak(utt);
}

/* ─── Ritual checklist steps ─────────────────────────────────────────── */
const ritualSteps = [
  {
    Icon: Smartphone,
    title: "Put screens away",
    description: "Place your phone face-down or in another room. This screen is the last one tonight.",
    iconBg: "#DBEAFE", iconColor: "#1D4ED8",
  },
  {
    Icon: Lightbulb,
    title: "Dim the lights",
    description: "Lower the light around you. Signal to your body that night is here.",
    iconBg: "#FEF3C7", iconColor: "#D97706",
  },
  {
    Icon: Thermometer,
    title: "Cool the room",
    description: "Open a window or lower the thermostat. The body sleeps best at 16–19°C.",
    iconBg: "#CFFAFE", iconColor: "#0E7490",
  },
  {
    Icon: Coffee,
    title: "Warm drink (optional)",
    description: "Chamomile, warm milk, or decaf tea — something warm and calming.",
    iconBg: "#FDE8D8", iconColor: "#C2410C",
  },
  {
    Icon: NotebookPen,
    title: "Brain dump",
    description: "Write down anything unfinished on your mind. It's captured — you can rest now.",
    iconBg: "#EDE9FE", iconColor: "#7C3AED",
  },
  {
    Icon: Waves,
    title: "JPMR body scan",
    description: "Guided progressive muscle relaxation. Tense and release each muscle group.",
    iconBg: "#1E1B4B", iconColor: "#A5B4FC",
    isJPMR: true,
  },
];

/* ─── Extra habits from Sleep Checklist xlsx ─────────────────────────── */
const extraHabitGroups = [
  {
    when: "Morning",
    habits: [
      { id: "m1", label: "Woke at the same time", desc: "Within 30 min of your usual time, even on weekends." },
      { id: "m2", label: "Got 10–30 min of daylight", desc: "Even a cloudy morning resets your body clock." },
    ],
  },
  {
    when: "During the day",
    habits: [
      { id: "d1", label: "Last caffeine by mid-afternoon", desc: "Caffeine lingers 6–8 hrs. Skipped it after 3 pm." },
      { id: "d2", label: "Moved my body today", desc: "Any movement. Harder exercise done earlier in the day." },
      { id: "d3", label: "Kept nap under 30 min (before 3 pm)", desc: "Longer or later naps eat into night-time sleep." },
    ],
  },
  {
    when: "Evening",
    habits: [
      { id: "e1", label: "Finished dinner 2–3 hrs before bed", desc: "A heavy meal close to bed lightens sleep quality." },
      { id: "e2", label: "Went easy on alcohol tonight", desc: "It breaks up sleep in the second half of the night." },
      { id: "e3", label: "Parked tomorrow's worries on paper", desc: "A quick to-do list so your mind doesn't hold it." },
    ],
  },
  {
    when: "Last hour",
    habits: [
      { id: "l1", label: "Started a wind-down routine", desc: "Something calming that signals sleep is coming." },
      { id: "l2", label: "Noted one good thing from today", desc: "One small line about something you're glad happened." },
    ],
  },
];

/* ─── JPMR muscle groups ─────────────────────────────────────────────── */
const jpmrGroups = [
  { label: "Toes & Feet", cue: "Curl your toes as tight as you can…", release: "Now let go completely… feel the warmth flow in…", tenseSeconds: 5, releaseSeconds: 12 },
  { label: "Calves", cue: "Press your heels firmly into the bed…", release: "Release… let your calves sink heavy and soft…", tenseSeconds: 5, releaseSeconds: 12 },
  { label: "Thighs", cue: "Squeeze both thighs together firmly…", release: "Let them go… feel the relaxation spread upward…", tenseSeconds: 5, releaseSeconds: 12 },
  { label: "Abdomen", cue: "Tighten your stomach, hold it in…", release: "Release… let your belly soften completely…", tenseSeconds: 5, releaseSeconds: 12 },
  { label: "Hands & Fists", cue: "Make tight fists with both hands…", release: "Open your hands… let every finger relax and uncurl…", tenseSeconds: 5, releaseSeconds: 12 },
  { label: "Arms & Shoulders", cue: "Tense both arms and shrug your shoulders to your ears…", release: "Drop everything… feel your shoulders melt downward…", tenseSeconds: 5, releaseSeconds: 12 },
  { label: "Face & Jaw", cue: "Scrunch your face, clench your jaw tight…", release: "Let your face go completely slack… jaw soft… brow smooth…", tenseSeconds: 5, releaseSeconds: 14 },
];

/* ─── JPMR Screen ─────────────────────────────────────────────────────── */
export function JPMRSession({ onDone }: { onDone: () => void }) {
  const [groupIdx, setGroupIdx] = useState(0);
  const [phase, setPhase] = useState<"tense" | "release" | "next">("tense");
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(jpmrGroups[0].tenseSeconds);
  const [done, setDone] = useState(false);

  // Speak cue when group/phase changes
  useEffect(() => {
    if (done) return;
    const grp = jpmrGroups[groupIdx];
    if (phase === "tense") speak(grp.cue);
    else if (phase === "release") speak(grp.release);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIdx, phase]);

  // Progress timer
  useEffect(() => {
    if (done || phase === "next") return;
    const grp = jpmrGroups[groupIdx];
    const dur = (phase === "tense" ? grp.tenseSeconds : grp.releaseSeconds) * 1000;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const prog = Math.min(elapsed / dur, 1);
      setProgress(prog);
      setSecondsLeft(Math.max(Math.ceil((dur - elapsed) / 1000), 0));
      if (elapsed >= dur) {
        clearInterval(tick);
        if (phase === "tense") {
          setPhase("release");
          setProgress(0);
        } else {
          if (groupIdx + 1 >= jpmrGroups.length) {
            setDone(true);
            speak("Beautiful. Your whole body is now deeply relaxed… drift into sleep…");
          } else {
            setPhase("next");
            setTimeout(() => {
              setGroupIdx(i => i + 1);
              setPhase("tense");
              setProgress(0);
            }, 1800);
          }
        }
      }
    }, 16);
    return () => clearInterval(tick);
  }, [groupIdx, phase, done]);

  const grp = jpmrGroups[Math.min(groupIdx, jpmrGroups.length - 1)];
  const isTense = phase === "tense";
  const circumference = 2 * Math.PI * 72;

  const advanceGroup = () => {
    if (groupIdx + 1 >= jpmrGroups.length) { setDone(true); return; }
    setGroupIdx(i => i + 1); setPhase("tense"); setProgress(0);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "linear-gradient(180deg, #0D0B1F 0%, #1E1B4B 50%, #312E81 100%)" }}
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
          style={{ background: "rgba(139,92,246,0.25)", border: "1.5px solid rgba(139,92,246,0.4)" }}
        >
          <Moon className="w-10 h-10" style={{ color: "#C4B5FD" }} />
        </motion.div>
        <h2 className="text-2xl mb-3" style={{ fontFamily: "Lora, serif", fontWeight: 400, color: "#F5F3FF" }}>
          Fully relaxed
        </h2>
        <p className="text-sm mb-10 max-w-xs" style={{ fontFamily: "Inter, sans-serif", color: "#A5B4FC", lineHeight: 1.7 }}>
          Every muscle has let go. Your body is ready for deep, restorative sleep.
        </p>
        <button
          onClick={onDone}
          className="px-8 py-3 rounded-2xl text-sm font-medium"
          style={{ background: "#8B5CF6", color: "white", fontFamily: "Inter, sans-serif" }}
        >
          Sleep well →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #0D0B1F 0%, #1E1B4B 50%, #312E81 100%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <button
          onClick={onDone}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "#C4B5FD" }} />
        </button>
        <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#7C6FAA" }}>
          {groupIdx + 1} / {jpmrGroups.length}
        </p>
        <div style={{ width: 40 }} />
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-8 px-4">
        {jpmrGroups.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === groupIdx ? 20 : 6,
              height: 6,
              background: i < groupIdx ? "#8B5CF6" : i === groupIdx ? "#C4B5FD" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center flex-1 justify-center px-6">
        {/* Muscle group label */}
        <AnimatePresence mode="wait">
          <motion.p
            key={grp.label}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="text-xs uppercase tracking-widest mb-6"
            style={{ fontFamily: "Inter, sans-serif", color: "#7C6FAA", letterSpacing: "0.14em" }}
          >
            {grp.label}
          </motion.p>
        </AnimatePresence>

        {/* Progress ring */}
        <div className="relative flex items-center justify-center mb-10" style={{ width: 180, height: 180 }}>
          <svg className="absolute" width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="90" cy="90" r="72" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle
              cx="90" cy="90" r="72" fill="none"
              stroke={isTense ? "#F87171" : "#8B5CF6"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.6s ease" }}
            />
          </svg>

          <motion.div
            animate={isTense
              ? { scale: [1, 1.08, 1], boxShadow: ["0 0 0 0px rgba(248,113,113,0.3)", "0 0 0 12px rgba(248,113,113,0)", "0 0 0 0px rgba(248,113,113,0)"] }
              : { scale: [1, 1.04, 1], boxShadow: ["0 0 0 0px rgba(139,92,246,0.3)", "0 0 0 16px rgba(139,92,246,0)", "0 0 0 0px rgba(139,92,246,0)"] }
            }
            transition={{ duration: isTense ? 1.2 : 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
            style={{
              background: isTense ? "rgba(248,113,113,0.18)" : "rgba(139,92,246,0.22)",
              border: `1.5px solid ${isTense ? "rgba(248,113,113,0.4)" : "rgba(139,92,246,0.4)"}`,
            }}
          >
            <span className="text-2xl font-semibold" style={{ color: isTense ? "#FCA5A5" : "#C4B5FD", fontFamily: "Inter, sans-serif" }}>
              {secondsLeft}
            </span>
          </motion.div>
        </div>

        {/* Phase label + cue */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${groupIdx}-${phase}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <p className="text-3xl mb-3" style={{ fontFamily: "Lora, serif", fontWeight: 400, color: "#F5F3FF" }}>
              {phase === "next" ? "Well done…" : isTense ? "Tense" : "Release"}
            </p>
            <p className="text-sm max-w-xs mx-auto" style={{ fontFamily: "Inter, sans-serif", color: "#A5B4FC", lineHeight: 1.65, fontStyle: "italic" }}>
              {phase === "next" ? "Moving to the next muscle group…" : isTense ? grp.cue : grp.release}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Skip */}
      <div className="flex justify-center pb-10">
        <button
          onClick={advanceGroup}
          className="text-xs px-4 py-2 rounded-xl"
          style={{ fontFamily: "Inter, sans-serif", color: "#7C6FAA", background: "rgba(255,255,255,0.05)" }}
        >
          Skip this group
        </button>
      </div>
    </div>
  );
}

/* ─── Breathing wind-down ─────────────────────────────────────────────── */
const breathPhases = [
  { label: "Inhale", duration: 4 },
  { label: "Hold", duration: 4 },
  { label: "Exhale", duration: 6 },
];
const TOTAL_BREATH_ROUNDS = 4;

function BreathingWindDown({ onDone }: { onDone: () => void }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [round, setRound] = useState(1);
  const [progress, setProgress] = useState(0);
  const [count, setCount] = useState(breathPhases[0].duration);
  const [done, setDone] = useState(false);
  const roundRef = useRef(1);

  useEffect(() => {
    if (done) return;
    const ph = breathPhases[phaseIdx];
    const dur = ph.duration * 1000;
    const start = Date.now();
    setCount(ph.duration);
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const prog = Math.min(elapsed / dur, 1);
      setProgress(prog);
      setCount(Math.max(Math.ceil((dur - elapsed) / 1000), 0));
      if (elapsed >= dur) {
        clearInterval(tick);
        const next = (phaseIdx + 1) % breathPhases.length;
        if (next === 0) {
          if (roundRef.current >= TOTAL_BREATH_ROUNDS) { setDone(true); return; }
          roundRef.current += 1; setRound(roundRef.current);
        }
        setPhaseIdx(next); setProgress(0);
      }
    }, 16);
    return () => clearInterval(tick);
  }, [phaseIdx, done]);

  const ph = breathPhases[phaseIdx];
  const scale = ph.label === "Inhale" ? 1 + progress * 0.45 : ph.label === "Exhale" ? 1.45 - progress * 0.45 : 1.22;

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "linear-gradient(180deg, #0D0B1F 0%, #1E1B4B 100%)" }}
      >
        <Moon className="w-14 h-14 mb-6" style={{ color: "#C4B5FD" }} />
        <h2 className="text-2xl mb-3" style={{ fontFamily: "Lora, serif", fontWeight: 400, color: "#F5F3FF" }}>Sleep well</h2>
        <p className="text-sm mb-10 max-w-xs" style={{ fontFamily: "Inter, sans-serif", color: "#A5B4FC", lineHeight: 1.7 }}>
          Your body and mind are prepared for deep rest. Close your eyes and let go.
        </p>
        <button onClick={onDone} className="px-8 py-3 rounded-2xl text-sm font-medium" style={{ background: "#8B5CF6", color: "white", fontFamily: "Inter, sans-serif" }}>
          Done
        </button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(180deg, #0D0B1F 0%, #1E1B4B 100%)", padding: 16 }}>
      <div className="w-full flex justify-between mb-10">
        <button onClick={onDone} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <ArrowLeft className="w-5 h-5" style={{ color: "#C4B5FD" }} />
        </button>
        <p className="text-xs self-center" style={{ fontFamily: "Inter, sans-serif", color: "#7C6FAA" }}>Round {round}/{TOTAL_BREATH_ROUNDS}</p>
        <div style={{ width: 40 }} />
      </div>

      <div className="relative flex items-center justify-center mb-12" style={{ width: 220, height: 220 }}>
        {[0.55, 0.72, 1].map((s, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: 160 * scale * s, height: 160 * scale * s,
            background: `rgba(139,92,246,${0.07 + i * 0.08})`,
            transition: "width 0.9s ease, height 0.9s ease",
          }} />
        ))}
        <div className="w-20 h-20 rounded-full flex flex-col items-center justify-center" style={{ background: "rgba(139,92,246,0.7)", backdropFilter: "blur(4px)", zIndex: 10 }}>
          <span className="text-2xl font-semibold" style={{ color: "white", fontFamily: "Inter, sans-serif" }}>{count}</span>
        </div>
      </div>

      <h2 className="text-4xl mb-2" style={{ fontFamily: "Lora, serif", fontWeight: 400, color: "#F5F3FF" }}>{ph.label}</h2>
      <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#7C6FAA" }}>4-4-6 sleep breath</p>
    </div>
  );
}

/* ─── Main SleepRitualScreen ──────────────────────────────────────────── */
interface SleepRitualScreenProps {
  onDone: () => void;
}

type View = "checklist" | "jpmr" | "breathing" | "done";

export function SleepRitualScreen({ onDone }: SleepRitualScreenProps) {
  const [view, setView] = useState<View>("checklist");
  const [checked, setChecked] = useState<boolean[]>(ritualSteps.map(() => false));
  const [soundOn, setSoundOn] = useState(true);
  const [showExtraHabits, setShowExtraHabits] = useState(false);
  const [extraChecked, setExtraChecked] = useState<Set<string>>(new Set());

  useSleepAmbient(soundOn && view === "checklist");

  const checkedCount = checked.filter(Boolean).length;
  const totalChecked = checkedCount + extraChecked.size;
  const canProceed = totalChecked >= 4;

  const handleStepTap = (i: number) => {
    const step = ritualSteps[i] as typeof ritualSteps[0] & { isJPMR?: boolean };
    if (step.isJPMR && !checked[i]) {
      setChecked(prev => prev.map((v, idx) => idx === i ? true : v));
      setView("jpmr");
    } else {
      setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
    }
  };

  const toggleExtra = (id: string) => {
    setExtraChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (view === "jpmr") return <JPMRSession onDone={() => setView("breathing")} />;
  if (view === "breathing") return <BreathingWindDown onDone={() => setView("done")} />;

  if (view === "done") {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "linear-gradient(180deg, #0D0B1F 0%, #1E1B4B 100%)" }}
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
          style={{ background: "rgba(139,92,246,0.2)", border: "1.5px solid rgba(139,92,246,0.35)" }}
        >
          <Moon className="w-10 h-10" style={{ color: "#C4B5FD" }} />
        </motion.div>
        <h2 className="text-2xl mb-3" style={{ fontFamily: "Lora, serif", fontWeight: 400, color: "#F5F3FF" }}>Sleep well</h2>
        <p className="text-sm mb-10 max-w-xs" style={{ fontFamily: "Inter, sans-serif", color: "#A5B4FC", lineHeight: 1.7 }}>
          You have prepared beautifully. Let go of the day. Rest is yours.
        </p>
        <button onClick={onDone} className="px-8 py-3 rounded-2xl text-sm font-medium" style={{ background: "#8B5CF6", color: "white", fontFamily: "Inter, sans-serif" }}>
          Done
        </button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #EDE9FE 0%, #F9F8FF 100%)", padding: "16px", paddingBottom: "40px" }}>
      {/* Header */}
      <div className="flex items-center gap-3 pt-8 pb-4">
        <button onClick={onDone} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.08)" }}>
          <ArrowLeft className="w-5 h-5" style={{ color: "#15113C" }} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>Sleep Ritual</h1>
          <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
            {totalChecked} {totalChecked === 1 ? "step" : "steps"} done · need 4 to proceed
          </p>
        </div>
        <button
          onClick={() => setSoundOn(s => !s)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: soundOn ? "rgba(139,92,246,0.12)" : "rgba(0,0,0,0.05)",
            border: `1.5px solid ${soundOn ? "rgba(139,92,246,0.3)" : "rgba(0,0,0,0.08)"}`,
          }}
        >
          {soundOn
            ? <Volume2 className="w-4 h-4" style={{ color: "#8B5CF6", strokeWidth: 1.75 }} />
            : <VolumeX className="w-4 h-4" style={{ color: "#9CA3AF", strokeWidth: 1.75 }} />
          }
        </button>
      </div>

      {/* Progress bar — shows progress toward the 4-step minimum */}
      <div className="h-1.5 rounded-full mb-1" style={{ background: "#E5E7EB" }}>
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${Math.min((totalChecked / 4) * 100, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ background: canProceed ? "linear-gradient(90deg, #7C3AED, #8B5CF6)" : "linear-gradient(90deg, #8B5CF6, #A78BFA)" }}
        />
      </div>
      <p className="text-right text-xs mb-4" style={{ fontFamily: "Inter, sans-serif", color: canProceed ? "#7C3AED" : "#C4B5FD" }}>
        {canProceed ? "Ready ✓" : `${totalChecked}/4`}
      </p>

      {/* Ambient badge */}
      {soundOn && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-xl self-start"
          style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
        >
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#8B5CF6" }}
          />
          <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#7C3AED" }}>Delta sleep tones</span>
        </motion.div>
      )}

      {/* Steps */}
      <div className="space-y-3 flex-1">
        {ritualSteps.map((step, i) => {
          const stepWithJPMR = step as typeof step & { isJPMR?: boolean };
          const isDone = checked[i];
          const isJPMR = !!stepWithJPMR.isJPMR;

          return (
            <motion.button
              key={i}
              onClick={() => handleStepTap(i)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.055, duration: 0.3 }}
              className="w-full p-4 rounded-2xl flex items-center gap-4 text-left"
              style={{
                background: isDone ? "rgba(139,92,246,0.09)" : "rgba(255,255,255,0.82)",
                border: isDone ? "1.5px solid rgba(139,92,246,0.3)" : "1.5px solid rgba(0,0,0,0.06)",
                cursor: "pointer",
                boxShadow: isDone ? "none" : "0 1px 6px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{ background: isDone ? "#8B5CF6" : step.iconBg }}
              >
                {isDone
                  ? <Check className="w-5 h-5" style={{ color: "white", strokeWidth: 2 }} />
                  : <step.Icon className="w-4 h-4" style={{ color: step.iconColor, strokeWidth: 1.75 }} />
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm mb-0.5 flex items-center gap-2" style={{
                  fontFamily: "Inter, sans-serif", fontWeight: 600,
                  color: isDone ? "#8B5CF6" : "#15113C",
                  textDecoration: isDone && !isJPMR ? "line-through" : "none",
                }}>
                  {step.title}
                  {isJPMR && !isDone && (
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.12)", color: "#7C3AED" }}>
                      Guided
                    </span>
                  )}
                </p>
                <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF", lineHeight: 1.4 }}>
                  {step.description}
                </p>
              </div>

              {!isDone && isJPMR && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.12)" }}>
                  <span style={{ color: "#8B5CF6", fontSize: 14, lineHeight: 1 }}>→</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Add more habits button */}
      <button
        onClick={() => setShowExtraHabits(true)}
        className="mt-4 w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm"
        style={{
          fontFamily: "Inter, sans-serif", fontWeight: 500,
          background: extraChecked.size > 0 ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.7)",
          border: extraChecked.size > 0 ? "1.5px solid rgba(139,92,246,0.25)" : "1.5px dashed rgba(0,0,0,0.12)",
          color: extraChecked.size > 0 ? "#7C3AED" : "#6B7280",
          cursor: "pointer",
        }}
      >
        <Plus className="w-4 h-4" />
        {extraChecked.size > 0
          ? `${extraChecked.size} extra habit${extraChecked.size !== 1 ? "s" : ""} added`
          : "Add habits I did today"}
      </button>

      {/* CTA */}
      <button
        onClick={() => setView("jpmr")}
        disabled={!canProceed}
        className="mt-3 w-full py-4 rounded-2xl text-sm font-medium transition-all"
        style={canProceed
          ? { background: "linear-gradient(135deg, #7C3AED, #8B5CF6)", color: "white", fontFamily: "Inter, sans-serif", boxShadow: "0 4px 20px rgba(139,92,246,0.35)", cursor: "pointer" }
          : { background: "#F3F4F6", color: "#C4C4D0", fontFamily: "Inter, sans-serif", cursor: "not-allowed" }
        }
      >
        {canProceed
          ? "Begin JPMR relaxation →"
          : `${4 - totalChecked} more step${4 - totalChecked !== 1 ? "s" : ""} to go`
        }
      </button>

      {/* Extra Habits Popup */}
      <AnimatePresence>
        {showExtraHabits && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowExtraHabits(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50 }}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51,
                background: "white", borderRadius: "24px 24px 0 0",
                padding: "20px 16px 40px", maxHeight: "80vh", overflowY: "auto",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold" style={{ fontFamily: "Lora, serif", color: "#15113C" }}>
                    Habits I did today
                  </h3>
                  <p className="text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
                    Tap any you completed — they count toward your 4.
                  </p>
                </div>
                <button
                  onClick={() => setShowExtraHabits(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "#F3F4F6" }}
                >
                  <X className="w-4 h-4" style={{ color: "#6B7280" }} />
                </button>
              </div>

              <div className="space-y-5">
                {extraHabitGroups.map(group => (
                  <div key={group.when}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF", letterSpacing: "0.1em" }}>
                      {group.when}
                    </p>
                    <div className="space-y-2">
                      {group.habits.map(habit => {
                        const selected = extraChecked.has(habit.id);
                        return (
                          <button
                            key={habit.id}
                            onClick={() => toggleExtra(habit.id)}
                            className="w-full p-3 rounded-2xl flex items-center gap-3 text-left"
                            style={{
                              background: selected ? "rgba(139,92,246,0.08)" : "#F9FAFB",
                              border: selected ? "1.5px solid rgba(139,92,246,0.3)" : "1.5px solid #F3F4F6",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                              style={{ background: selected ? "#8B5CF6" : "#E5E7EB" }}
                            >
                              {selected && <Check className="w-3 h-3" style={{ color: "white", strokeWidth: 2.5 }} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium" style={{ fontFamily: "Inter, sans-serif", color: selected ? "#7C3AED" : "#15113C" }}>
                                {habit.label}
                              </p>
                              <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF", lineHeight: 1.4 }}>
                                {habit.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowExtraHabits(false)}
                className="mt-6 w-full py-3.5 rounded-2xl text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #7C3AED, #8B5CF6)", color: "white", fontFamily: "Inter, sans-serif", cursor: "pointer" }}
              >
                Done — {extraChecked.size > 0 ? `${extraChecked.size} added` : "no extras"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

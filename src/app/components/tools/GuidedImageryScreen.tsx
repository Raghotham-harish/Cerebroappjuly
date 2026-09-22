import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, Check, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ─── TTS ───────────────────────────────────────────────────────────── */
function speakText(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.85; utt.pitch = 1;
  const preferred = window.speechSynthesis.getVoices().find(v =>
    v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Google US English Female")
  );
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
}

/* ─── Ambient audio hook ─────────────────────────────────────────────
   Each landscape gets its own drone frequency + timbre.
   Starts on a user gesture (landscape selection), fades in/out.
   ───────────────────────────────────────────────────────────────────── */
function useAmbientAudio(landscapeId: string | null, enabled: boolean) {
  const audioRef = useRef<{ ctx: AudioContext; stop: () => void } | null>(null);

  useEffect(() => {
    // Teardown existing
    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current = null;
    }
    if (!enabled || !landscapeId) return;

    try {
      // @ts-ignore
      const ctx = new (window.AudioContext || window.webkitAudioContext)() as AudioContext;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 2.5);
      master.connect(ctx.destination);

      // Landscape-specific frequencies (binaural/therapeutic tuning)
      const freqMap: Record<string, [number, number, number]> = {
        forest:   [98.0, 196.0, 147.0],   // G2 + G3 + D3
        ocean:    [136.1, 204.2, 170.1],   // C#3 + …
        mountain: [256.0, 384.0, 320.0],   // C4 + G4 + E4
        meadow:   [174.6, 261.9, 220.0],   // F3 + C4 + A3
      };

      const [f1, f2, f3] = freqMap[landscapeId] ?? [174.6, 261.9, 220.0];

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
      const osc2 = makeOsc(f2, 0.22);
      const osc3 = makeOsc(f3, 0.14);

      // Very slow LFO for organic movement
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.07;
      lfoGain.gain.value = 0.012;
      lfo.connect(lfoGain);
      lfoGain.connect(master.gain);
      lfo.start();

      const stop = () => {
        try {
          master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
          setTimeout(() => {
            [osc1, osc2, osc3, lfo].forEach(o => { try { o.stop(); } catch {} });
            ctx.close();
          }, 900);
        } catch {}
      };

      audioRef.current = { ctx, stop };
    } catch (e) {
      console.warn("Ambient audio unavailable:", e);
    }

    return () => {
      audioRef.current?.stop();
      audioRef.current = null;
    };
  }, [landscapeId, enabled]);
}

/* ─── Landscape-specific animated particle overlays ─────────────────── */

// Falling leaves — Forest
function ForestParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: `${8 + (i * 9.3) % 84}%`,
      size: 9 + (i * 2.7) % 11,
      duration: 6 + (i * 0.8) % 5,
      delay: (i * 0.75) % 5,
      xDrift: (i % 2 ? 1 : -1) * (18 + (i * 14) % 45),
      rotation: (i * 47) % 360,
    })), []);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 3 }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left, top: -20,
            width: p.size, height: p.size * 0.65,
            borderRadius: "50% 50% 40% 60%",
            background: `rgba(74, 222, 128, ${0.25 + (p.id * 0.05) % 0.3})`,
          }}
          animate={{ y: "110vh", x: [0, p.xDrift, 0], rotate: [p.rotation, p.rotation + 180, p.rotation + 360], opacity: [0.8, 0.6, 0.1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

// Wave ripples — Ocean
function OceanWaves() {
  const waves = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      bottom: `${12 + i * 10}%`,
      duration: 3.5 + i * 0.6,
      delay: i * 0.7,
      opacity: 0.06 + i * 0.03,
    })), []);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 3 }}>
      {waves.map(w => (
        <motion.div
          key={w.id}
          style={{
            position: "absolute",
            left: "-10%", bottom: w.bottom,
            width: "120%", height: 2,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
            borderRadius: 999,
          }}
          animate={{ x: ["-5%", "5%", "-5%"], opacity: [w.opacity, w.opacity * 1.6, w.opacity] }}
          transition={{ duration: w.duration, delay: w.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* Shimmer overlay */}
      <motion.div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 50%, rgba(96,165,250,0.06) 100%)",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Floating orbs — Mountain
function MountainOrbs() {
  const orbs = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: `${5 + (i * 17) % 90}%`,
      size: 14 + (i * 8) % 30,
      duration: 8 + (i * 1.2) % 7,
      delay: (i * 1.4) % 6,
      yRange: 20 + (i * 12) % 35,
    })), []);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 3 }}>
      {orbs.map(o => (
        <motion.div
          key={o.id}
          style={{
            position: "absolute",
            left: o.left,
            top: `${20 + (o.id * 13) % 55}%`,
            width: o.size, height: o.size,
            borderRadius: "50%",
            background: `rgba(255,255,255,${0.04 + (o.id * 0.02) % 0.08})`,
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          animate={{ y: [0, -o.yRange, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: o.duration, delay: o.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// Floating petals — Meadow
function MeadowPetals() {
  const petals = useMemo(() =>
    Array.from({ length: 9 }, (_, i) => ({
      id: i,
      left: `${5 + (i * 10.8) % 90}%`,
      size: 7 + (i * 2.3) % 9,
      duration: 7 + (i * 0.9) % 6,
      delay: (i * 0.85) % 6,
      xDrift: (i % 2 ? 1 : -1) * (15 + (i * 10) % 40),
      hue: (i * 42) % 60, // pink to yellow range
    })), []);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 3 }}>
      {petals.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left, bottom: -20,
            width: p.size, height: p.size,
            borderRadius: "70% 30% 70% 30% / 30% 70% 30% 70%",
            background: `hsla(${340 + p.hue}, 90%, 80%, 0.45)`,
          }}
          animate={{ y: [0, -window.innerHeight * 1.2], x: [0, p.xDrift], rotate: [0, 270], opacity: [0.7, 0.4, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function ParticleOverlay({ landscapeId }: { landscapeId: string }) {
  if (landscapeId === "forest") return <ForestParticles />;
  if (landscapeId === "ocean") return <OceanWaves />;
  if (landscapeId === "mountain") return <MountainOrbs />;
  if (landscapeId === "meadow") return <MeadowPetals />;
  return null;
}

/* ─── Data ───────────────────────────────────────────────────────────── */
interface GuidedImageryScreenProps {
  onDone: () => void;
}

const landscapes = [
  {
    id: "forest",
    name: "Forest Sanctuary",
    emoji: "🌲",
    photo: "https://images.unsplash.com/photo-1544039161-b0c20826c6f6?w=800&h=1200&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1544039161-b0c20826c6f6?w=400&h=240&fit=crop&auto=format",
  },
  {
    id: "ocean",
    name: "Ocean Shore",
    emoji: "🌊",
    photo: "https://images.unsplash.com/photo-1618413002870-00a51e1c2bb6?w=800&h=1200&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1618413002870-00a51e1c2bb6?w=400&h=240&fit=crop&auto=format",
  },
  {
    id: "mountain",
    name: "Mountain Peak",
    emoji: "⛰️",
    photo: "https://images.unsplash.com/photo-1589887305888-6254d60b5308?w=800&h=1200&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1589887305888-6254d60b5308?w=400&h=240&fit=crop&auto=format",
  },
  {
    id: "meadow",
    name: "Sunlit Meadow",
    emoji: "🌸",
    photo: "https://images.unsplash.com/photo-1782332576168-159393638224?w=800&h=1200&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1782332576168-159393638224?w=400&h=240&fit=crop&auto=format",
  },
];

const scripts: Record<string, string[]> = {
  forest: [
    "Close your eyes and take three slow, deep breaths. Let your body soften into stillness.",
    "You are standing at the edge of an ancient forest. The air smells of pine and damp earth. Morning light filters through a canopy of leaves.",
    "You walk slowly along a moss-covered path. Birdsong echoes gently around you. Each step feels grounded, safe.",
    "You find a clearing with a large, warm stone. You sit. The forest hums quietly around you. Nothing is required of you here.",
    "You are held by the forest. You breathe. You belong. Stay here as long as you need.",
  ],
  ocean: [
    "Close your eyes. Take three slow breaths. Let the sounds of the world fade.",
    "You are standing on a quiet beach at sunrise. The sand is cool beneath your feet. The horizon is a soft blush of pink and gold.",
    "You walk to the water's edge. Gentle waves arrive and retreat. Each wave carries something away — a worry, a tension, a thought.",
    "You sit and watch the ocean breathe. You breathe with it. In… and out. Vast, patient, endless.",
    "The ocean holds no judgment. It simply is. And so are you, in this moment. Completely enough.",
  ],
  mountain: [
    "Close your eyes. Take three steady breaths. Feel the ground beneath you.",
    "You are at the base of a great mountain. The sky above is clear and blue. The air is crisp, clean, still.",
    "You begin to climb. Each step is slow and deliberate. You don't rush — the mountain is patient.",
    "You reach a high ridge. You can see far in every direction — valleys, rivers, clouds below. From here, your concerns look small.",
    "You are strong enough. You have climbed before. The view from stillness is always wider.",
  ],
  meadow: [
    "Close your eyes. Breathe in warmth. Breathe out whatever is tight.",
    "You are lying in a meadow of wildflowers. The sun is gentle on your skin. Bees hum nearby.",
    "The flowers sway in a soft breeze. Lavender, chamomile, clover. Everything blooms in its own time.",
    "You feel the earth supporting you completely. You don't have to hold anything up. You can just receive.",
    "The meadow is where you return to yourself. Unhurried. Unguarded. Fully alive.",
  ],
};

/* ─── Main Component ─────────────────────────────────────────────────── */
export function GuidedImageryScreen({ onDone }: GuidedImageryScreenProps) {
  const [landscape, setLandscape] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [soundOn, setSoundOn] = useState(true); // ambient music

  // Ambient audio
  useAmbientAudio(landscape, soundOn);

  const land = landscapes.find(l => l.id === landscape);
  const script = landscape ? scripts[landscape] : [];

  const toggleVoice = () => {
    if (voiceOn) { window.speechSynthesis?.cancel(); setVoiceOn(false); }
    else { setVoiceOn(true); if (landscape) speakText(scripts[landscape][stepIdx]); }
  };

  const handleNext = () => {
    if (stepIdx < script.length - 1) {
      const next = stepIdx + 1;
      setStepIdx(next);
      if (voiceOn && landscape) speakText(scripts[landscape][next]);
    } else {
      window.speechSynthesis?.cancel();
      setCompleted(true);
    }
  };

  const handleSelectLandscape = (id: string) => {
    setLandscape(id);
    setStepIdx(0);
    setCompleted(false);
    if (voiceOn) speakText(scripts[id][0]);
  };

  const handleBack = () => {
    setLandscape(null);
    setStepIdx(0);
    window.speechSynthesis?.cancel();
  };

  /* ── Completion ── */
  if (completed && land) {
    return (
      <div style={{
        minHeight: "100vh", position: "relative",
        backgroundImage: `url(${land.photo})`,
        backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "24px",
      }}>
        <ParticleOverlay landscapeId={land.id} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,5,25,0.62)", zIndex: 2 }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "relative", zIndex: 10,
            display: "flex", flexDirection: "column",
            alignItems: "center", textAlign: "center", maxWidth: 320,
          }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 24,
          }}>
            <Check style={{ width: 36, height: 36, color: "white", strokeWidth: 1.75 }} />
          </div>
          <h2 style={{ fontFamily: "Lora, serif", fontWeight: 500, fontSize: "1.6rem", color: "white", marginBottom: 12, lineHeight: 1.3 }}>
            Journey complete
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: 40 }}>
            Carry this feeling with you. The {land.name.toLowerCase()} is always within reach.
          </p>
          <button onClick={onDone} style={{
            width: "100%", padding: "14px 0", borderRadius: 999,
            background: "white", border: "none", color: "#0A0519",
            fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
          }}>
            Done
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Active session ── */
  if (landscape && land) {
    const progress = ((stepIdx + 1) / script.length) * 100;

    return (
      <div style={{
        minHeight: "100vh", position: "relative",
        backgroundImage: `url(${land.photo})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        {/* Animated overlay for landscape */}
        <ParticleOverlay landscapeId={land.id} />

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          background: "linear-gradient(to bottom, rgba(10,5,25,0.58) 0%, rgba(10,5,25,0.04) 42%, rgba(10,5,25,0.62) 72%, rgba(10,5,25,0.92) 100%)",
        }} />

        {/* Slow ambient zoom on the photo */}
        <motion.div
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{
            width: "100%", height: "100%",
            backgroundImage: `url(${land.photo})`,
            backgroundSize: "cover", backgroundPosition: "center",
          }} />
        </motion.div>

        {/* Header */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "52px 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <button onClick={handleBack} style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(0,0,0,0.38)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}>
              <ArrowLeft style={{ width: 20, height: 20, color: "white" }} />
            </button>

            <div style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
              <div style={{ fontFamily: "Lora, serif", fontWeight: 500, fontSize: "1.12rem", color: "white", lineHeight: 1.2 }}>
                {land.emoji} {land.name}
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.73rem", color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                Scene {stepIdx + 1} of {script.length}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {/* Ambient sound toggle */}
              <button onClick={() => setSoundOn(v => !v)} style={{
                width: 40, height: 40, borderRadius: "50%",
                background: soundOn ? "rgba(139,92,246,0.45)" : "rgba(0,0,0,0.38)",
                border: soundOn ? "1px solid rgba(196,181,253,0.5)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                {soundOn
                  ? <Volume2 style={{ width: 18, height: 18, color: "white" }} />
                  : <VolumeX style={{ width: 18, height: 18, color: "rgba(255,255,255,0.6)" }} />}
              </button>
              {/* Voice narration toggle */}
              <button onClick={toggleVoice} style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(0,0,0,0.38)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                {voiceOn
                  ? <Mic style={{ width: 18, height: 18, color: "white" }} />
                  : <MicOff style={{ width: 18, height: 18, color: "rgba(255,255,255,0.6)" }} />}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,0.28)", overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ height: "100%", borderRadius: 999, background: "white" }}
            />
          </div>
        </div>

        {/* Scene text at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, padding: "16px 16px 36px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIdx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              style={{
                background: "rgba(255,255,255,0.11)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 24,
                padding: 24,
                marginBottom: 16,
              }}
            >
              <p style={{ fontFamily: "Lora, serif", fontStyle: "italic", fontSize: "1rem", color: "white", lineHeight: 1.85, margin: 0 }}>
                {script[stepIdx]}
              </p>
            </motion.div>
          </AnimatePresence>

          <button onClick={handleNext} style={{
            width: "100%", padding: "14px 0", borderRadius: 999,
            background: "rgba(255,255,255,0.2)",
            border: "1.5px solid rgba(255,255,255,0.35)",
            color: "white", fontFamily: "Inter, sans-serif",
            fontWeight: 700, fontSize: "1rem", cursor: "pointer",
          }}>
            {stepIdx < script.length - 1 ? "Continue" : "Complete journey"}
          </button>
        </div>
      </div>
    );
  }

  /* ── Selection screen ── */
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)",
      padding: "16px 16px 40px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 40, paddingBottom: 24 }}>
        <button onClick={onDone} style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
        }}>
          <ArrowLeft style={{ width: 20, height: 20, color: "#15113C" }} />
        </button>
        <div>
          <h1 style={{ fontFamily: "Lora, serif", fontWeight: 500, fontSize: "1.5rem", color: "#15113C", margin: 0, lineHeight: 1.2 }}>
            Guided Imagery
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "#9CA3AF", margin: "4px 0 0" }}>
            Choose your landscape — ambient sound included
          </p>
        </div>
      </div>

      {/* Ambient sound preview note */}
      <div style={{
        background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)",
        borderRadius: 16, padding: "10px 14px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Volume2 style={{ width: 16, height: 16, color: "#8B5CF6", flexShrink: 0 }} />
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#6D28D9", margin: 0, lineHeight: 1.4 }}>
          Each landscape plays a healing ambient drone tuned to calm your nervous system.
        </p>
      </div>

      {/* 2×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {landscapes.map((l) => (
          <motion.button
            key={l.id}
            onClick={() => handleSelectLandscape(l.id)}
            whileTap={{ scale: 0.96 }}
            style={{
              position: "relative", minHeight: 170,
              borderRadius: 20, overflow: "hidden",
              border: "none", cursor: "pointer", padding: 0,
              backgroundImage: `url(${l.thumb})`,
              backgroundSize: "cover", backgroundPosition: "center",
            }}
          >
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(10,5,25,0.82) 0%, rgba(10,5,25,0.1) 60%, transparent 100%)",
            }} />
            <div style={{ position: "absolute", bottom: 12, left: 14 }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{l.emoji}</div>
              <div style={{ fontFamily: "Lora, serif", fontWeight: 500, fontSize: "0.95rem", color: "white", lineHeight: 1.2 }}>
                {l.name}
              </div>
            </div>
            <div style={{ position: "absolute", bottom: 12, right: 14, fontFamily: "Inter, sans-serif", fontSize: "1rem", color: "white" }}>
              →
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

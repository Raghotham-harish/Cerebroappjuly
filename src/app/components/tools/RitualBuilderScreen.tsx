import { useState } from "react";
import { ArrowLeft, Check, Plus, X, Sun, Moon, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RitualBuilderScreenProps {
  onDone: () => void;
}

const morningDefaults = [
  "Drink a glass of water",
  "5 minutes of silence",
  "Set today's intention",
  "Light movement or stretch",
];
const eveningDefaults = [
  "Reflect on 3 things that went well",
  "Prepare tomorrow's top task",
  "Screen-free wind-down (30 min)",
  "Gratitude moment",
];

type RitualType = "morning" | "evening" | null;

const PURPLE = "#8B5CF6";
const PAGE_BG = "linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)";
const DONE_BG = "linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 100%)";

/* ─── Info Modal ─────────────────────────────────────────────────────── */
function InfoModal({ onClose }: { onClose: () => void }) {
  const tips = [
    { icon: "🕐", title: "Start small", body: "Begin with 2–3 steps. A 5-minute ritual done daily beats an elaborate one skipped." },
    { icon: "📍", title: "Anchor to existing habits", body: "Pair your ritual with something you already do — waking up, brushing teeth, or making coffee." },
    { icon: "🔁", title: "Consistency builds identity", body: "Repeating the same sequence every day trains your brain to enter the right state automatically." },
    { icon: "✏️", title: "Customise freely", body: "Remove steps that don't serve you. Add steps that feel meaningful. Your ritual should feel yours." },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "absolute", inset: 0, background: "rgba(15,10,40,0.45)", backdropFilter: "blur(2px)" }}
        />

        {/* Sheet */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          style={{
            position: "relative", zIndex: 10,
            background: "white",
            borderRadius: "28px 28px 0 0",
            padding: "28px 20px 40px",
            maxHeight: "82vh",
            overflowY: "auto",
          }}
        >
          {/* Drag handle */}
          <div style={{
            width: 38, height: 4, borderRadius: 999,
            background: "#E5E7EB", margin: "0 auto 24px",
          }} />

          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <h2 style={{ fontFamily: "Lora, serif", fontSize: 20, fontWeight: 500, color: "#15113C", margin: 0 }}>
              How Ritual Builder Works
            </h2>
            <button onClick={onClose} style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "#F3F4F6", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}>
              <X style={{ width: 16, height: 16, color: "#6B7280" }} />
            </button>
          </div>

          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#6B7280", lineHeight: 1.6, marginBottom: 24 }}>
            A ritual is a short, intentional sequence you do at the same time each day. Morning rituals prime your mind for focus and energy. Evening rituals signal to your brain that it's safe to rest.
          </p>

          {/* Steps */}
          <div style={{
            background: "linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)",
            borderRadius: 18, padding: "16px 18px", marginBottom: 24,
          }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", color: PURPLE, marginBottom: 12, textTransform: "uppercase" }}>
              How to use it
            </p>
            {[
              "Choose Morning or Evening ritual",
              "Review the suggested steps — remove any that don't fit",
              "Add your own steps using the input at the bottom",
              "Tap 'Save ritual' to lock it in",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < 3 ? 10 : 0 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: PURPLE, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 1,
                }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: "white" }}>{i + 1}</span>
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#374151", lineHeight: 1.5, margin: 0 }}>{step}</p>
              </div>
            ))}
          </div>

          {/* Tips */}
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", color: "#9CA3AF", marginBottom: 14, textTransform: "uppercase" }}>
            Science-backed tips
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tips.map((t, i) => (
              <div key={i} style={{
                display: "flex", gap: 14, padding: "14px 16px",
                background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(139,92,246,0.10)",
                borderRadius: 16,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.4 }}>{t.icon}</span>
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: "#15113C", margin: "0 0 3px" }}>{t.title}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#6B7280", lineHeight: 1.55, margin: 0 }}>{t.body}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={onClose} style={{
            width: "100%", padding: "14px 0", borderRadius: 999, marginTop: 24,
            background: PURPLE, color: "white", border: "none",
            fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}>
            Got it
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export function RitualBuilderScreen({ onDone }: RitualBuilderScreenProps) {
  const [type, setType] = useState<RitualType>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState("");
  const [saved, setSaved] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const loadDefaults = (t: RitualType) => {
    setType(t);
    setSteps(t === "morning" ? [...morningDefaults] : [...eveningDefaults]);
    setSaved(false);
  };

  const addStep = () => {
    if (newStep.trim()) { setSteps(prev => [...prev, newStep.trim()]); setNewStep(""); }
  };
  const removeStep = (i: number) => setSteps(prev => prev.filter((_, idx) => idx !== i));
  const save = () => setSaved(true);

  /* ── Saved confirmation ── */
  if (saved && type) {
    const RitualIcon = type === "morning" ? Sun : Moon;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: DONE_BG }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: PURPLE }}
        >
          <RitualIcon className="w-10 h-10" style={{ color: "white", strokeWidth: 1.5 }} />
        </motion.div>
        <h2 className="text-2xl mb-2 text-center" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
          {type === "morning" ? "Morning" : "Evening"} ritual saved
        </h2>
        <p className="text-sm mb-4 text-center" style={{ fontFamily: "Inter, sans-serif", color: "#4C1D95" }}>
          {steps.length} steps — consistency builds the self
        </p>
        <div className="w-full max-w-xs space-y-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ background: "rgba(255,255,255,0.7)" }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: PURPLE }}>
                <Check className="w-3 h-3" style={{ color: "white" }} />
              </div>
              <span className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#15113C" }}>{s}</span>
            </div>
          ))}
        </div>
        <button onClick={onDone} style={{
          width: "100%", maxWidth: 240, padding: "14px 0", borderRadius: 999,
          background: PURPLE, color: "white", border: "none",
          fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer",
        }}>
          Done
        </button>
      </div>
    );
  }

  /* ── Step builder ── */
  if (type) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: PAGE_BG, padding: "16px", paddingBottom: "40px" }}>
        <div className="flex items-center gap-3 pt-8 pb-6">
          <button onClick={() => setType(null)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.08)" }}>
            <ArrowLeft className="w-5 h-5" style={{ color: "#15113C" }} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="text-2xl" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
              {type === "morning" ? "Morning" : "Evening"} Ritual
            </h1>
            <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>Tap × to remove a step</p>
          </div>
          <button onClick={() => setShowInfo(true)} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
          }}>
            <Info style={{ width: 16, height: 16, color: "#8B5CF6" }} />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <AnimatePresence>
            {steps.map((s, i) => (
              <motion.div
                key={s + i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(139,92,246,0.15)" }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: PURPLE }}>
                  <span className="text-xs" style={{ color: "white", fontFamily: "Inter, sans-serif", fontWeight: 700 }}>{i + 1}</span>
                </div>
                <span className="flex-1 text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#15113C" }}>{s}</span>
                <button onClick={() => removeStep(i)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                  <X className="w-3 h-3" style={{ color: "#6B7280" }} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            value={newStep}
            onChange={e => setNewStep(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addStep()}
            placeholder="Add a ritual step…"
            className="flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none"
            style={{ fontFamily: "Inter, sans-serif", color: "#15113C", background: "white", border: "1.5px solid rgba(139,92,246,0.2)" }}
          />
          <button onClick={addStep} className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: PURPLE }}>
            <Plus className="w-5 h-5" style={{ color: "white" }} />
          </button>
        </div>

        <button onClick={save} style={{
          width: "100%", padding: "14px 0", borderRadius: 999,
          background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
          color: "white", border: "none",
          fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
        }}>
          Save ritual
        </button>

        {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
      </div>
    );
  }

  /* ── Type selection ── */
  return (
    <div className="min-h-screen" style={{ background: PAGE_BG, padding: "16px", paddingBottom: "40px" }}>
      <div className="flex items-center gap-3 pt-8 pb-8">
        <button onClick={onDone} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.08)" }}>
          <ArrowLeft className="w-5 h-5" style={{ color: "#15113C" }} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="text-2xl" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>Ritual Builder</h1>
          <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>Consistency creates the self</p>
        </div>
        <button onClick={() => setShowInfo(true)} style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
        }}>
          <Info style={{ width: 16, height: 16, color: "#8B5CF6" }} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.button
          onClick={() => loadDefaults("morning")}
          whileTap={{ scale: 0.96 }}
          className="p-6 rounded-3xl flex flex-col items-center gap-3"
          style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(139,92,246,0.15)", minHeight: 168, cursor: "pointer" }}
        >
          <Sun className="w-10 h-10" style={{ color: "#F59E0B" }} />
          <span className="text-base" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#15113C" }}>Morning</span>
          <span className="text-xs text-center" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>Start the day with intention</span>
        </motion.button>

        <motion.button
          onClick={() => loadDefaults("evening")}
          whileTap={{ scale: 0.96 }}
          className="p-6 rounded-3xl flex flex-col items-center gap-3"
          style={{ background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(139,92,246,0.15)", minHeight: 168, cursor: "pointer" }}
        >
          <Moon className="w-10 h-10" style={{ color: PURPLE }} />
          <span className="text-base" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#15113C" }}>Evening</span>
          <span className="text-xs text-center" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>Close the day with reflection</span>
        </motion.button>
      </div>

      {/* Brief explainer card */}
      <div style={{
        background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(139,92,246,0.12)",
        borderRadius: 20, padding: "18px 18px", marginTop: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Info style={{ width: 15, height: 15, color: PURPLE }} />
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: "#15113C", margin: 0 }}>
            What is a ritual?
          </p>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>
          A ritual is a short intentional sequence repeated at the same time each day. Research shows that daily rituals reduce anxiety, improve focus, and strengthen self-regulation.
        </p>
        <button
          onClick={() => setShowInfo(true)}
          style={{
            marginTop: 10, fontFamily: "Inter, sans-serif", fontSize: 12, color: PURPLE,
            fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          Learn how to build yours →
        </button>
      </div>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}

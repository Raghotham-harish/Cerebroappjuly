import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const PAGE_BG = "linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)";
const PURPLE = "#8B5CF6";
const DARK = "#15113C";

const PHYSICAL_CONDITIONS = [
  "Heart disease",
  "Reproductive health concerns (PCOS, endometriosis, infertility, etc.)",
  "Diabetes",
  "Cancer",
  "Arthritis or other chronic pain",
  "Asthma, COPD or other lung conditions",
  "Movement Disorders (involuntary tics, tardive dyskinesia, etc.)",
  "Digestive problems (Crohn's, colitis, IBS, etc.)",
  "Neurological conditions (epilepsy, etc.) or traumatic brain injury (TBI)",
  "Other…",
];

const MH_CONTRIBUTORS = [
  "Abuse or violence",
  "Relationship problems (friends, family, or significant other)",
  "Body image",
  "Low self-esteem or self-image",
  "School or work problems",
  "Financial problems",
  "Loneliness or isolation",
  "Grief or loss of someone or something",
  "Experiencing hate/bullying (including racism, homophobia, transphobia, or discrimination)",
  "State of the world (war, climate, politics, immigration)",
  "I don't know (something just feels wrong)",
  "Other…",
];

export interface HealthAnswers {
  insurance: "yes" | "no" | "dont_know" | null;
  physicalConditions: string[];
  mhContributors: string[];
}

interface AboutYourHealthScreenProps {
  onComplete: (answers: HealthAnswers) => void;
  onSkip: () => void;
}

function InsuranceButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <button
      onClick={onPress}
      className="px-6 py-3 rounded-full transition-all active:scale-95"
      style={{
        background: selected ? PURPLE : "rgba(255,255,255,0.88)",
        color: selected ? "white" : DARK,
        border: `1.5px solid ${selected ? PURPLE : "rgba(139,92,246,0.18)"}`,
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: "0.02em",
        minWidth: 96,
        boxShadow: selected ? "0 4px 14px rgba(139,92,246,0.3)" : "none",
      }}
    >
      {label}
    </button>
  );
}

function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-start gap-3 py-3 text-left active:opacity-80 transition-opacity"
      style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center mt-0.5"
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: `2px solid ${checked ? PURPLE : "rgba(139,92,246,0.35)"}`,
          background: checked ? PURPLE : "transparent",
          transition: "all 0.15s ease",
        }}
      >
        {checked && <Check style={{ width: 12, height: 12, color: "white", strokeWidth: 2.5 }} />}
      </div>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#374151", lineHeight: 1.55 }}>
        {label}
      </span>
    </button>
  );
}

/* ── Screen 1: Physical health ───────────────────────────────────── */
function Screen1({
  answers,
  onChange,
  onNext,
  onSkip,
}: {
  answers: HealthAnswers;
  onChange: (a: Partial<HealthAnswers>) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const toggleCondition = (item: string) => {
    const next = answers.physicalConditions.includes(item)
      ? answers.physicalConditions.filter((c) => c !== item)
      : [...answers.physicalConditions, item];
    onChange({ physicalConditions: next });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PAGE_BG, fontFamily: "Inter, sans-serif" }}>
      <div style={{ height: 44 }} />

      {/* Header */}
      <div className="px-5 pb-2">
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", color: PURPLE, textTransform: "uppercase", marginBottom: 4 }}>
          About Your Health · 1 of 2
        </p>
        <h1 style={{ fontFamily: "Lora, serif", fontSize: 24, fontWeight: 500, color: DARK, lineHeight: 1.25 }}>
          About Your Health
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 6, lineHeight: 1.6 }}>
          This helps personalise your experience. All answers are private.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-36" style={{ scrollbarWidth: "none" } as React.CSSProperties}>

        {/* Insurance question */}
        <div
          className="rounded-3xl p-5 mb-5 mt-4"
          style={{ background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(139,92,246,0.12)" }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: DARK, marginBottom: 14, lineHeight: 1.5 }}>
            Do you currently have health insurance?
          </p>
          <div className="flex flex-wrap gap-3">
            <InsuranceButton label="YES" selected={answers.insurance === "yes"} onPress={() => onChange({ insurance: "yes" })} />
            <InsuranceButton label="NO" selected={answers.insurance === "no"} onPress={() => onChange({ insurance: "no" })} />
            <InsuranceButton label="I DON'T KNOW" selected={answers.insurance === "dont_know"} onPress={() => onChange({ insurance: "dont_know" })} />
          </div>
        </div>

        {/* Physical conditions */}
        <div
          className="rounded-3xl p-5"
          style={{ background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(139,92,246,0.12)" }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: DARK, marginBottom: 2, lineHeight: 1.5 }}>
            Do you have any of the following physical health conditions?
          </p>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 14 }}>Select all that apply.</p>
          {PHYSICAL_CONDITIONS.map((item) => (
            <CheckRow
              key={item}
              label={item}
              checked={answers.physicalConditions.includes(item)}
              onToggle={() => toggleCondition(item)}
            />
          ))}
        </div>
      </div>

      {/* Fixed CTAs */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-10 pt-4 flex flex-col gap-3"
        style={{ background: "linear-gradient(to top, #F5F3FF 60%, transparent)" }}
      >
        <button
          onClick={onNext}
          className="w-full py-4 rounded-full flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.02em",
            boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
            border: "none",
          }}
        >
          Continue <ArrowRight style={{ width: 16, height: 16, strokeWidth: 2 }} />
        </button>
        <button
          onClick={onSkip}
          style={{ fontSize: 13, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", minHeight: 44 }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

/* ── Screen 2: Mental health contributors ────────────────────────── */
function Screen2({
  answers,
  onChange,
  onBack,
  onDone,
  onSkip,
}: {
  answers: HealthAnswers;
  onChange: (a: Partial<HealthAnswers>) => void;
  onBack: () => void;
  onDone: () => void;
  onSkip: () => void;
}) {
  const MAX = 3;

  const toggleContributor = (item: string) => {
    const selected = answers.mhContributors.includes(item);
    if (!selected && answers.mhContributors.length >= MAX) return;
    const next = selected
      ? answers.mhContributors.filter((c) => c !== item)
      : [...answers.mhContributors, item];
    onChange({ mhContributors: next });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PAGE_BG, fontFamily: "Inter, sans-serif" }}>
      <div style={{ height: 44 }} />

      {/* Header */}
      <div className="px-5 pb-2 flex items-start gap-3">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(139,92,246,0.15)" }}
          aria-label="Back"
        >
          <ArrowLeft style={{ width: 18, height: 18, color: DARK, strokeWidth: 1.75 }} />
        </button>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", color: PURPLE, textTransform: "uppercase", marginBottom: 4 }}>
            About Your Health · 2 of 2
          </p>
          <h1 style={{ fontFamily: "Lora, serif", fontSize: 22, fontWeight: 500, color: DARK, lineHeight: 1.25 }}>
            What's contributing right now?
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-36 mt-3" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
        <div
          className="rounded-3xl p-5"
          style={{ background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(139,92,246,0.12)" }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: DARK, marginBottom: 2, lineHeight: 1.5 }}>
            What are the main things contributing to your mental health right now?
          </p>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 14 }}>
            Choose up to {MAX}. {answers.mhContributors.length}/{MAX} selected.
          </p>
          {MH_CONTRIBUTORS.map((item) => {
            const checked = answers.mhContributors.includes(item);
            const disabled = !checked && answers.mhContributors.length >= MAX;
            return (
              <button
                key={item}
                onClick={() => !disabled && toggleContributor(item)}
                className="w-full flex items-start gap-3 py-3 text-left transition-opacity"
                style={{
                  borderBottom: "1px solid rgba(139,92,246,0.08)",
                  opacity: disabled ? 0.4 : 1,
                  cursor: disabled ? "default" : "pointer",
                }}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: `2px solid ${checked ? PURPLE : "rgba(139,92,246,0.35)"}`,
                    background: checked ? PURPLE : "transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  {checked && <Check style={{ width: 12, height: 12, color: "white", strokeWidth: 2.5 }} />}
                </div>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#374151", lineHeight: 1.55 }}>
                  {item}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed CTAs */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-10 pt-4 flex flex-col gap-3"
        style={{ background: "linear-gradient(to top, #F5F3FF 60%, transparent)" }}
      >
        <button
          onClick={onDone}
          className="w-full py-4 rounded-full"
          style={{
            background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.02em",
            boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
            border: "none",
          }}
        >
          Done
        </button>
        <button
          onClick={onSkip}
          style={{ fontSize: 13, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", minHeight: 44 }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

/* ── Orchestrator ────────────────────────────────────────────────── */
export function AboutYourHealthScreen({ onComplete, onSkip }: AboutYourHealthScreenProps) {
  const [screen, setScreen] = useState<1 | 2>(1);
  const [answers, setAnswers] = useState<HealthAnswers>({
    insurance: null,
    physicalConditions: [],
    mhContributors: [],
  });

  const patch = (a: Partial<HealthAnswers>) => setAnswers((prev) => ({ ...prev, ...a }));

  if (screen === 1) {
    return (
      <Screen1
        answers={answers}
        onChange={patch}
        onNext={() => setScreen(2)}
        onSkip={onSkip}
      />
    );
  }

  return (
    <Screen2
      answers={answers}
      onChange={patch}
      onBack={() => setScreen(1)}
      onDone={() => onComplete(answers)}
      onSkip={onSkip}
    />
  );
}

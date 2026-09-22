import { ArrowLeft, ChevronRight, HeartPulse, Flame, Shield, Zap, AlertCircle, Activity, BarChart2, Sparkles, ClipboardList, Brain, Clock, CheckCircle2 } from "lucide-react";

const PAGE_BG = "linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)";
const PURPLE = "#8B5CF6";

interface Assessment {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  icon: React.ElementType;
  iconBg: string;
  duration: string;
  items: number;
  group: string;
}

const ASSESSMENTS: Assessment[] = [
  // — Anxiety
  {
    id: "gad7",
    name: "Generalised Anxiety Scale",
    subtitle: "GAD-7",
    description: "Measures anxiety frequency over the past two weeks.",
    tag: "ANXIETY",
    tagColor: "#1D4ED8",
    tagBg: "#DBEAFE",
    icon: HeartPulse,
    iconBg: "#DBEAFE",
    duration: "2 min",
    items: 7,
    group: "Anxiety",
  },
  {
    id: "anxiety-assess",
    name: "Anxiety Check-in",
    subtitle: "PSWQ",
    description: "Penn State Worry Questionnaire — worry tendency scale.",
    tag: "ANXIETY",
    tagColor: "#1D4ED8",
    tagBg: "#DBEAFE",
    icon: HeartPulse,
    iconBg: "#DBEAFE",
    duration: "3 min",
    items: 16,
    group: "Anxiety",
  },
  // — Depression & Stress
  {
    id: "dass",
    name: "Depression, Anxiety & Stress",
    subtitle: "DASS-21",
    description: "Assesses three overlapping emotional states across 21 items.",
    tag: "DASS",
    tagColor: "#7C3AED",
    tagBg: "#EDE9FE",
    icon: Brain,
    iconBg: "#EDE9FE",
    duration: "5 min",
    items: 21,
    group: "Mood",
  },
  // — Burnout (quick first)
  {
    id: "siboq",
    name: "Burnout Quick Check",
    subtitle: "SIBOQ",
    description: "Single-item fatigue screen — fastest burnout signal.",
    tag: "QUICK",
    tagColor: "#0891B2",
    tagBg: "#CFFAFE",
    icon: Zap,
    iconBg: "#CFFAFE",
    duration: "1 min",
    items: 1,
    group: "Burnout",
  },
  {
    id: "rbst",
    name: "Rapid Burnout Screener",
    subtitle: "RBST",
    description: "4-item burnout risk screen — a quick pulse check.",
    tag: "BURNOUT",
    tagColor: "#B45309",
    tagBg: "#FEF3C7",
    icon: AlertCircle,
    iconBg: "#FEF3C7",
    duration: "2 min",
    items: 4,
    group: "Burnout",
  },
  {
    id: "burnout-bat",
    name: "Burnout Assessment Tool",
    subtitle: "BAT",
    description: "Comprehensive 22-item burnout indicator across four dimensions.",
    tag: "BURNOUT",
    tagColor: "#B45309",
    tagBg: "#FEF3C7",
    icon: Flame,
    iconBg: "#FEF3C7",
    duration: "5 min",
    items: 22,
    group: "Burnout",
  },
  {
    id: "olbi",
    name: "Burnout — Oldenburg",
    subtitle: "OLBI",
    description: "Measures exhaustion and disengagement across 16 items.",
    tag: "BURNOUT",
    tagColor: "#B45309",
    tagBg: "#FEF3C7",
    icon: Activity,
    iconBg: "#FEF3C7",
    duration: "4 min",
    items: 16,
    group: "Burnout",
  },
  {
    id: "cbi",
    name: "Copenhagen Burnout Inventory",
    subtitle: "CBI",
    description: "Personal, work, and client burnout across 19 items.",
    tag: "BURNOUT",
    tagColor: "#B45309",
    tagBg: "#FEF3C7",
    icon: BarChart2,
    iconBg: "#FEF3C7",
    duration: "5 min",
    items: 19,
    group: "Burnout",
  },
  // — Gratitude
  {
    id: "grat",
    name: "Gratitude Scale",
    subtitle: "GRAT",
    description: "Short-form 16-item gratitude disposition measure.",
    tag: "GRAT",
    tagColor: "#059669",
    tagBg: "#D1FAE5",
    icon: Sparkles,
    iconBg: "#D1FAE5",
    duration: "3 min",
    items: 16,
    group: "Gratitude",
  },
  {
    id: "gratitude-assess",
    name: "Gratitude Assessment",
    subtitle: "GQ-6",
    description: "Six-item gratitude questionnaire — the most used scale.",
    tag: "GRATITUDE",
    tagColor: "#059669",
    tagBg: "#D1FAE5",
    icon: ClipboardList,
    iconBg: "#D1FAE5",
    duration: "2 min",
    items: 6,
    group: "Gratitude",
  },
  // — Trauma
  {
    id: "trauma-assess",
    name: "Trauma Symptoms Check-in",
    subtitle: "TSQ",
    description: "10-item trauma symptom questionnaire.",
    tag: "TRAUMA",
    tagColor: "#9F1239",
    tagBg: "#FFE4E6",
    icon: Shield,
    iconBg: "#FFE4E6",
    duration: "3 min",
    items: 10,
    group: "Trauma",
  },
  // — Childhood
  {
    id: "ace",
    name: "Childhood Experiences",
    subtitle: "ACE",
    description: "Adverse childhood experiences — a reflective 10-item screen.",
    tag: "ACE",
    tagColor: "#6B7280",
    tagBg: "#F3F4F6",
    icon: Shield,
    iconBg: "#F3F4F6",
    duration: "3 min",
    items: 10,
    group: "Childhood",
  },
];

const GROUPS = ["Anxiety", "Mood", "Burnout", "Gratitude", "Trauma", "Childhood"];

interface AssessmentHubScreenProps {
  onSelectAssessment: (id: string) => void;
  onBack: () => void;
}

export function AssessmentHubScreen({ onSelectAssessment, onBack }: AssessmentHubScreenProps) {
  const grouped = GROUPS.map((g) => ({
    group: g,
    items: ASSESSMENTS.filter((a) => a.group === g),
  }));

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: PAGE_BG, fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(139,92,246,0.15)" }}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "#15113C", strokeWidth: 1.75 }} />
        </button>
        <div>
          <h1 style={{ fontFamily: "Lora, serif", fontSize: 22, fontWeight: 500, color: "#15113C", lineHeight: 1.2 }}>
            Wellbeing Assessments
          </h1>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
            {ASSESSMENTS.length} validated instruments
          </p>
        </div>
      </div>

      {/* Intro card */}
      <div
        className="mx-4 mb-5 rounded-3xl px-5 py-4"
        style={{
          background: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
          border: "1.5px solid rgba(139,92,246,0.2)",
        }}
      >
        <p style={{ fontSize: 13, color: "#5B21B6", lineHeight: 1.6 }}>
          These assessments are <strong>for reflection only</strong> — not clinical diagnosis. Results guide your personalised action plan.
        </p>
      </div>

      {/* Grouped lists */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {grouped.map(({ group, items }) =>
          items.length === 0 ? null : (
            <div key={group} className="mb-6">
              {/* Group overline */}
              <p
                className="mb-3"
                style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                {group}
              </p>

              {/* Assessment cards */}
              <div className="flex flex-col gap-2">
                {items.map((a) => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.id}
                      onClick={() => onSelectAssessment(a.id)}
                      className="w-full text-left active:scale-[0.98] transition-transform"
                      style={{
                        background: "rgba(255,255,255,0.88)",
                        border: "1.5px solid rgba(139,92,246,0.10)",
                        borderRadius: 20,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        cursor: "pointer",
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="flex-shrink-0 flex items-center justify-center"
                        style={{ width: 44, height: 44, borderRadius: 14, background: a.iconBg }}
                      >
                        <Icon style={{ width: 20, height: 20, color: "#15113C", strokeWidth: 1.75 }} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#15113C" }}>{a.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              color: a.tagColor,
                              background: a.tagBg,
                              borderRadius: 6,
                              padding: "2px 6px",
                            }}
                          >
                            {a.subtitle}
                          </span>
                          <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#9CA3AF" }}>
                            <Clock style={{ width: 11, height: 11, strokeWidth: 1.75 }} />
                            {a.duration}
                          </span>
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>·</span>
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{a.items} items</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#6B7280", marginTop: 3, lineHeight: 1.45 }}>
                          {a.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight style={{ width: 18, height: 18, color: "#D1D5DB", strokeWidth: 1.75, flexShrink: 0 }} />
                    </button>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* Bottom note */}
        <div className="flex items-start gap-2 px-1 mb-4">
          <CheckCircle2 style={{ width: 14, height: 14, color: "#9CA3AF", strokeWidth: 1.75, flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.55 }}>
            All assessments use validated, research-backed instruments. Results stay private on your device.
          </p>
        </div>
      </div>
    </div>
  );
}

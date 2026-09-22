import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import {
  Heart, Wind, Brain, Eye, BookHeart, Target, Calendar, Users, Scan,
  Layers, MessageCircle, Moon, Plus, Gamepad2, ChevronRight,
  ChevronDown, Clock, Bell, ClipboardList, Shield, Flame, HeartPulse,
  Activity, Zap, BarChart2, List, AlertCircle,
} from "lucide-react";

type ToolCategory = "all" | "practice" | "assess" | "sos";

interface Tool {
  id: string;
  name: string;
  description: string;
  tag: string;
  icon: React.ElementType;
  category: "practice" | "assess" | "sos";
}

interface ToolsScreenProps {
  onNavigateToGames?: () => void;
  onOpenAssessmentHub?: () => void;
  onSelectTool?: (toolId: string) => void;
  onOpenNotifications?: () => void;
  notifUnreadCount?: number;
}

const CARD_BG = "rgba(255,255,255,0.88)";
const CARD_BORDER = "1.5px solid rgba(139,92,246,0.12)";
const ICON_COLOR = "#15113C";
const CHIP_TEXT = "#15113C";

const TAG_STYLES: Record<string, { iconBg: string; chipBg: string }> = {
  BODY:    { iconBg: "#CCFBF1", chipBg: "#99F6E4" },
  SELF:    { iconBg: "#EDE9FE", chipBg: "#C4B5FD" },
  PSYCHE:  { iconBg: "#FEF3C7", chipBg: "#FDE68A" },
  DAILY:   { iconBg: "#DBEAFE", chipBg: "#BFDBFE" },
  AGENCY:  { iconBg: "#DCFCE7", chipBg: "#BBF7D0" },
  HABIT:   { iconBg: "#FCE7F3", chipBg: "#FBCFE8" },
  PARTS:   { iconBg: "#FFF7ED", chipBg: "#FED7AA" },
  SOMATIC: { iconBg: "#CFFAFE", chipBg: "#A5F3FC" },
  ZER:     { iconBg: "#FFE4E6", chipBg: "#FECDD3" },
  MIND:    { iconBg: "#E0E7FF", chipBg: "#C7D2FE" },
  SOS:     { iconBg: "#FEE2E2", chipBg: "#FCA5A5" },
  REST:    { iconBg: "#F3E8FF", chipBg: "#E9D5FF" },
  ASSESS:  { iconBg: "#FEF3C7", chipBg: "#FDE68A" },
  TRAUMA:  { iconBg: "#CFFAFE", chipBg: "#A5F3FC" },
  BURNOUT: { iconBg: "#FEE2E2", chipBg: "#FCA5A5" },
  ANXIETY: { iconBg: "#DBEAFE", chipBg: "#BFDBFE" },
  GAD:     { iconBg: "#DBEAFE", chipBg: "#BFDBFE" },
  DASS:    { iconBg: "#E0E7FF", chipBg: "#C7D2FE" },
  GRAT:    { iconBg: "#FEF3C7", chipBg: "#FDE68A" },
  ACE:     { iconBg: "#CFFAFE", chipBg: "#A5F3FC" },
};

// ── Mock history data ──────────────────────────────────────────────────────────
interface HistorySession {
  id: string;
  date: string;
  summary: string;
  duration: string;
}

interface ToolHistoryEntry {
  toolId: string;
  toolName: string;
  icon: React.ElementType;
  tag: string;
  sessions: HistorySession[];
}

const MOCK_HISTORY: ToolHistoryEntry[] = [
  {
    toolId: "breath",
    toolName: "Breath Loops",
    icon: Wind,
    tag: "BODY",
    sessions: [
      { id: "b1", date: "Today, 8:23 AM",       summary: "4-7-8 breathing · 3 cycles · Felt calmer after", duration: "4 min" },
      { id: "b2", date: "Yesterday, 9:10 PM",    summary: "Box breathing · 5 cycles · Good sleep prep",    duration: "6 min" },
      { id: "b3", date: "Aug 8, 7:45 AM",        summary: "Coherence breathing · 4 cycles",                duration: "5 min" },
      { id: "b4", date: "Aug 7, 2:30 PM",        summary: "4-7-8 breathing · 2 cycles · Work break",       duration: "3 min" },
    ],
  },
  {
    toolId: "gratitude",
    toolName: "Gratitude Journal",
    icon: BookHeart,
    tag: "DAILY",
    sessions: [
      { id: "g1", date: "Today, 7:15 AM",     summary: "3 gratitudes · Focused on relationships",  duration: "3 min" },
      { id: "g2", date: "Yesterday, 7:30 AM", summary: "3 gratitudes · Nature & small joys",        duration: "4 min" },
      { id: "g3", date: "Aug 8, 8:00 AM",     summary: "3 gratitudes · Work achievements",          duration: "3 min" },
    ],
  },
  {
    toolId: "zer",
    toolName: "Zone of Emotional Regulation",
    icon: Layers,
    tag: "ZER",
    sessions: [
      { id: "z1", date: "Aug 9, 3:15 PM",  summary: "High Unpleasant → Regulate & Release · Anxious", duration: "8 min" },
      { id: "z2", date: "Aug 7, 11:45 AM", summary: "Low Unpleasant → Restore & Connect · Tired",      duration: "7 min" },
      { id: "z3", date: "Aug 5, 4:30 PM",  summary: "High Unpleasant → Regulate & Release · Stressed", duration: "9 min" },
    ],
  },
  {
    toolId: "affirmations",
    toolName: "Affirmations",
    icon: MessageCircle,
    tag: "MIND",
    sessions: [
      { id: "a1", date: "Today, 7:00 AM",  summary: "Strength category · 5 affirmations",    duration: "3 min" },
      { id: "a2", date: "Aug 9, 7:30 AM",  summary: "Self-Worth category · 5 affirmations",  duration: "3 min" },
      { id: "a3", date: "Aug 8, 8:15 AM",  summary: "Calm category · 5 affirmations",        duration: "3 min" },
      { id: "a4", date: "Aug 7, 7:00 AM",  summary: "Clarity category · 5 affirmations",     duration: "3 min" },
    ],
  },
  {
    toolId: "crisis",
    toolName: "Micro Grounding",
    icon: Heart,
    tag: "SOS",
    sessions: [
      { id: "m1", date: "Aug 8, 2:30 PM", summary: "5-4-3-2-1 grounding · Anxiety before meeting", duration: "3 min" },
      { id: "m2", date: "Aug 6, 7:45 PM", summary: "Cold breath technique · Evening overwhelm",     duration: "2 min" },
    ],
  },
  {
    toolId: "bodyscan",
    toolName: "Body Scan",
    icon: Scan,
    tag: "SOMATIC",
    sessions: [
      { id: "s1", date: "Aug 9, 9:00 PM", summary: "Full body scan · 7 zones · Tension in shoulders", duration: "12 min" },
      { id: "s2", date: "Aug 6, 9:30 PM", summary: "Full body scan · 7 zones · Good relaxation",      duration: "11 min" },
    ],
  },
];

// ── History sub-components ────────────────────────────────────────────────────
function SessionRow({ session }: { session: HistorySession }) {
  return (
    <div
      className="flex items-start gap-3 py-3"
      style={{ borderTop: "1px solid rgba(139,92,246,0.08)" }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "#EDE9FE" }}
      >
        <Clock className="w-3.5 h-3.5" style={{ color: ICON_COLOR, strokeWidth: 1.75 }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold mb-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#15113C" }}>
          {session.date}
        </p>
        <p className="text-xs leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>
          {session.summary}
        </p>
      </div>
      <span
        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ background: "#F3F4F6", color: "#9CA3AF", fontFamily: "Inter, sans-serif", fontWeight: 600 }}
      >
        {session.duration}
      </span>
    </div>
  );
}

function HistoryCard({
  entry,
  expanded,
  onToggle,
}: {
  entry: ToolHistoryEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const tagStyle = TAG_STYLES[entry.tag] ?? TAG_STYLES.SELF;
  const lastSession = entry.sessions[0];

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: CARD_BG, border: CARD_BORDER, boxShadow: "0 2px 10px rgba(139,92,246,0.06)" }}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: tagStyle.iconBg }}
        >
          <entry.icon className="w-5 h-5" style={{ color: ICON_COLOR, strokeWidth: 1.75 }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold truncate" style={{ fontFamily: "Inter, sans-serif", color: "#15113C" }}>
              {entry.toolName}
            </h3>
            {entry.tag && (
              <span
                className="text-xs px-2 py-0.5 rounded-md flex-shrink-0"
                style={{ background: tagStyle.chipBg, color: CHIP_TEXT, fontFamily: "Inter", fontWeight: 700, fontSize: "10px", letterSpacing: "0.06em" }}
              >
                {entry.tag}
              </span>
            )}
          </div>
          <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
            {entry.sessions.length} session{entry.sessions.length !== 1 ? "s" : ""} · Last: {lastSession.date}
          </p>
        </div>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{ color: "#9CA3AF", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", strokeWidth: 1.75 }}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-3">
          {entry.sessions.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bell button ─────────────────────────────────────────────────────────────
function BellButton({ count = 0, onClick }: { count?: number; onClick?: () => void }) {
  return (
    <div className="relative mt-1">
      <button
        onClick={onClick}
        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90"
        style={{ background: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(139,92,246,0.18)" }}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" style={{ color: "#15113C", strokeWidth: 1.75 }} />
      </button>
      {count > 0 && (
        <div
          className="absolute -top-1 -right-1 flex items-center justify-center rounded-full"
          style={{ minWidth: 17, height: 17, background: "#8B5CF6", fontFamily: "Inter", fontWeight: 700, fontSize: "9px", color: "white", paddingLeft: 3, paddingRight: 3 }}
        >
          {count}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ToolsScreen({ onNavigateToGames, onOpenAssessmentHub, onSelectTool, onOpenNotifications, notifUnreadCount = 0 }: ToolsScreenProps = {}) {
  const [activeTab, setActiveTab] = useState<"tools" | "history">("tools");
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("all");
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const gridTools: Tool[] = [
    { id: "breath",            name: "Breath Loops",                  description: "4-7-8 · Box · Coherence · 5 min",         tag: "BODY",    icon: Wind,          category: "practice" },
    { id: "disidentification", name: "Disidentification",             description: "I have thoughts, I am not thoughts",       tag: "SELF",    icon: Brain,         category: "practice" },
    { id: "imagery",           name: "Guided Imagery",                description: "Visualization & inner landscape · 8 min",  tag: "PSYCHE",  icon: Eye,           category: "practice" },
    { id: "gratitude",         name: "Gratitude Journal",             description: "Daily anchoring practice · 3 min",         tag: "DAILY",   icon: BookHeart,     category: "practice" },
    { id: "will",              name: "Will Training",                 description: "Acts of Will daily exercises",             tag: "AGENCY",  icon: Target,        category: "practice" },
    { id: "ritual",            name: "Ritual Builder",                description: "Morning · Evening · Create rituals",       tag: "HABIT",   icon: Calendar,      category: "practice" },
    { id: "subpersonality",    name: "Subpersonality Work",           description: "Meet & integrate inner parts",             tag: "PARTS",   icon: Users,         category: "practice" },
    { id: "bodyscan",          name: "Body Scan",                     description: "Grounding through body awareness · 12 min", tag: "SOMATIC", icon: Scan,         category: "practice" },
    { id: "zer",               name: "Emotional Regulation",          description: "Locate, understand & regulate emotions",   tag: "ZER",     icon: Layers,        category: "practice" },
    { id: "affirmations",      name: "Affirmations",                  description: "Personalized affirmation builder · 3 min", tag: "MIND",    icon: MessageCircle, category: "practice" },
    { id: "sleep",             name: "Sleep Ritual",                  description: "Wind-down & sleep preparation",            tag: "REST",    icon: Moon,          category: "practice" },

  ];

  const sosTool: Tool = { id: "crisis", name: "Micro Grounding", description: "Quick grounding — available anytime", tag: "SOS", icon: Heart, category: "sos" };

  const practiceCount = gridTools.filter((t) => t.category === "practice").length;
  const TOTAL_ASSESSMENTS = 12;

  const CATEGORY_TABS: { id: ToolCategory; label: string; count?: number }[] = [
    { id: "all",      label: "All",          count: practiceCount + 3 },
    { id: "practice", label: "Practice",     count: practiceCount },
    { id: "assess",   label: "Assessments",  count: TOTAL_ASSESSMENTS },
    { id: "sos",      label: "Urgent",       count: 1 },
  ];

  const filteredGridTools = activeCategory === "all" ? gridTools : gridTools.filter((t) => t.category === activeCategory);
  const showFeatured     = activeCategory === "all" || activeCategory === "sos";
  const showGames        = activeCategory === "all" || activeCategory === "practice";
  const showAssessments  = activeCategory === "all" || activeCategory === "assess";

  const handleToolClick = (toolId: string) => {
    if (onSelectTool) onSelectTool(toolId);
  };

  const toggleHistory = (toolId: string) => {
    setExpandedToolId((prev) => (prev === toolId ? null : toolId));
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)",
        padding: "16px",
        paddingBottom: "128px",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between pt-10 pb-4 px-2">
        <div>
          <h1 className="text-3xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
            Tools
          </h1>
          <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
            Your psychosynthesis toolkit
          </p>
        </div>
        <BellButton count={notifUnreadCount} onClick={onOpenNotifications} />
      </div>

      {/* Tab switcher: Tools / History */}
      <div
        className="flex p-1 rounded-2xl mb-4"
        style={{ background: "rgba(255,255,255,0.6)", border: "1.5px solid rgba(139,92,246,0.12)" }}
      >
        {(["tools", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize"
            style={{
              fontFamily: "Inter, sans-serif",
              background: activeTab === tab ? "#8B5CF6" : "transparent",
              color: activeTab === tab ? "white" : "#9CA3AF",
              boxShadow: activeTab === tab ? "0 2px 8px rgba(139,92,246,0.28)" : "none",
            }}
          >
            {tab === "tools" ? "Tools" : "History"}
          </button>
        ))}
      </div>

      {/* ── TOOLS TAB ── */}
      {activeTab === "tools" && (
        <>
          {/* Category filter row */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className="flex-shrink-0 px-4 py-2 rounded-full transition-all duration-200"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  background: activeCategory === tab.id ? "#8B5CF6" : "rgba(255,255,255,0.75)",
                  color: activeCategory === tab.id ? "white" : "#6B7280",
                  border: activeCategory === tab.id ? "1.5px solid #8B5CF6" : "1.5px solid rgba(139,92,246,0.15)",
                  boxShadow: activeCategory === tab.id ? "0 2px 8px rgba(139,92,246,0.25)" : "none",
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className="ml-1.5 inline-flex items-center justify-center rounded-full"
                    style={{
                      background: activeCategory === tab.id ? "rgba(255,255,255,0.25)" : "#EDE9FE",
                      color: activeCategory === tab.id ? "white" : "#8B5CF6",
                      fontSize: 11,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      padding: "0 4px",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Featured: Micro Grounding (SOS) */}
          {showFeatured && (
            <div className="mb-3">
              <button
                onClick={() => handleToolClick(sosTool.id)}
                className="w-full p-5 rounded-3xl flex items-center justify-between active:scale-98 transition-transform"
                style={{ background: CARD_BG, border: CARD_BORDER, boxShadow: "0 2px 12px rgba(139,92,246,0.08)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: TAG_STYLES.SOS.iconBg }}>
                    <Heart className="w-6 h-6" style={{ color: ICON_COLOR, strokeWidth: 1.75 }} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base mb-0.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#15113C" }}>
                      {sosTool.name}
                    </h3>
                    <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>
                      {sosTool.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: ICON_COLOR, opacity: 0.4, strokeWidth: 1.75 }} />
              </button>
            </div>
          )}

          {/* Mindful Games */}
          {showGames && (
            <div className="mb-4">
              <button
                onClick={onNavigateToGames}
                className="w-full p-5 rounded-3xl flex items-center justify-between active:scale-98 transition-transform"
                style={{ background: "linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 100%)", border: "1.5px solid rgba(139,92,246,0.25)", boxShadow: "0 2px 12px rgba(139,92,246,0.12)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.6)" }}>
                    <Gamepad2 className="w-6 h-6" style={{ color: ICON_COLOR, strokeWidth: 1.75 }} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base mb-0.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#15113C" }}>
                      Mindful Games
                    </h3>
                    <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6" }}>
                      19 games · focus, memory & emotional strength
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: ICON_COLOR, opacity: 0.4, strokeWidth: 1.75 }} />
              </button>
            </div>
          )}

          {/* Assessments hub card */}
          {showAssessments && (
            <div className="mb-4">
              <button
                onClick={onOpenAssessmentHub}
                className="w-full p-5 rounded-3xl flex items-center justify-between active:scale-98 transition-transform"
                style={{ background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 60%, #FCD34D 100%)", border: "1.5px solid rgba(180,83,9,0.2)", boxShadow: "0 2px 12px rgba(180,83,9,0.10)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.6)" }}>
                    <ClipboardCheck className="w-6 h-6" style={{ color: "#15113C", strokeWidth: 1.75 }} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base mb-0.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#15113C" }}>
                      Wellbeing Assessments
                    </h3>
                    <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#B45309" }}>
                      12 validated instruments · anxiety · burnout · gratitude
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: "#15113C", opacity: 0.4, strokeWidth: 1.75 }} />
              </button>
            </div>
          )}

          {/* Tool grid — practice only when assess filter active */}
          {activeCategory !== "assess" && (
          <div className="grid grid-cols-2 gap-3">
            {filteredGridTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className="p-4 rounded-3xl relative text-left active:scale-97 transition-transform"
                style={{
                  background: CARD_BG,
                  border: CARD_BORDER,
                  minHeight: "148px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 1px 8px rgba(139,92,246,0.06)",
                }}
              >
                {tool.tag && (
                  <div
                    className="absolute top-3 right-3 px-2 py-0.5 rounded-md"
                    style={{
                      background: TAG_STYLES[tool.tag]?.chipBg ?? "#EDE9FE",
                      color: CHIP_TEXT,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: "10px",
                      letterSpacing: "0.07em",
                    }}
                  >
                    {tool.tag}
                  </div>
                )}

                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: TAG_STYLES[tool.tag]?.iconBg ?? "#F3F4F6" }}
                >
                  <tool.icon className="w-5 h-5" style={{ color: ICON_COLOR, strokeWidth: 1.75 }} />
                </div>

                <div className="flex-1">
                  <h3 className="text-sm mb-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#15113C", lineHeight: 1.3 }}>
                    {tool.name}
                  </h3>
                  <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", lineHeight: 1.4 }}>
                    {tool.description}
                  </p>
                </div>
              </button>
            ))}

            {/* Coming soon placeholder */}
            <div
              className="p-4 rounded-3xl col-span-2 flex flex-col items-center justify-center"
              style={{ background: "rgba(255,255,255,0.5)", border: "1.5px dashed rgba(139,92,246,0.2)", minHeight: "88px" }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: "#EDE9FE" }}>
                <Plus className="w-4 h-4" style={{ color: ICON_COLOR, strokeWidth: 1.75 }} />
              </div>
              <p className="text-sm mb-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", fontWeight: 500 }}>
                More coming soon
              </p>
              <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
                CBT exercises, Somatic practices, and more
              </p>
            </div>
          </div>
          )}
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" && (
        <div>
          <div className="flex gap-3 mb-5">
            {[
              { label: "Total sessions", value: MOCK_HISTORY.reduce((sum, e) => sum + e.sessions.length, 0) },
              { label: "Tools used", value: MOCK_HISTORY.length },
              { label: "Day streak", value: 7 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex-1 p-3 rounded-2xl text-center"
                style={{ background: CARD_BG, border: CARD_BORDER }}
              >
                <p className="text-2xl font-semibold mb-0.5" style={{ fontFamily: "Lora, serif", color: "#8B5CF6" }}>
                  {stat.value}
                </p>
                <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <p className="text-xs mb-3 px-1 font-semibold" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF", letterSpacing: "0.06em" }}>
            RECENT ACTIVITY
          </p>

          <div className="flex flex-col gap-3">
            {MOCK_HISTORY.map((entry) => (
              <HistoryCard
                key={entry.toolId}
                entry={entry}
                expanded={expandedToolId === entry.toolId}
                onToggle={() => toggleHistory(entry.toolId)}
              />
            ))}

            <div
              className="p-4 rounded-3xl flex flex-col items-center justify-center"
              style={{ background: "rgba(255,255,255,0.5)", border: "1.5px dashed rgba(139,92,246,0.2)", minHeight: "72px" }}
            >
              <p className="text-sm mb-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", fontWeight: 500 }}>
                {gridTools.length - MOCK_HISTORY.length + 1} tools not yet explored
              </p>
              <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
                Start a session to build your history
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

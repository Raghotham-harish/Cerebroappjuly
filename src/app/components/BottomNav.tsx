import { Sparkles, User, Zap, Grid3x3 } from "lucide-react";
import { AnimatedLogo } from "./AnimatedLogo";

interface BottomNavProps {
  activeTab: "activities" | "chat" | "insights" | "tools" | "profile";
  onTabChange: (tab: "activities" | "chat" | "insights" | "tools" | "profile") => void;
}

const ACTIVE = "#8B5CF6";
const INACTIVE = "#9CA3AF";

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const s = (id: typeof activeTab) => ({
    color: activeTab === id ? ACTIVE : INACTIVE,
    weight: activeTab === id ? 600 : 400,
    stroke: 1.75,
  });

  const btnStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: "6px 14px",
    minWidth: 48,
    minHeight: 48,
    background: "none",
    border: "none",
    cursor: "pointer",
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t"
      style={{ background: "white", borderColor: "#E5E7EB", paddingBottom: "env(safe-area-inset-bottom, 16px)", paddingTop: 6 }}
    >
      <button onClick={() => onTabChange("activities")} style={btnStyle}>
        <Grid3x3 style={{ width: 22, height: 22, color: s("activities").color, strokeWidth: s("activities").stroke }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: s("activities").color, fontWeight: s("activities").weight, letterSpacing: "0.03em" }}>ACTIVITIES</span>
      </button>

      <button onClick={() => onTabChange("insights")} style={btnStyle}>
        <Sparkles style={{ width: 22, height: 22, color: s("insights").color, strokeWidth: s("insights").stroke }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: s("insights").color, fontWeight: s("insights").weight, letterSpacing: "0.03em" }}>INSIGHTS</span>
      </button>

      <button onClick={() => onTabChange("chat")} style={btnStyle}>
        <AnimatedLogo size={22} animate={activeTab === "chat"} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: s("chat").color, fontWeight: s("chat").weight, letterSpacing: "0.03em" }}>ORACLE</span>
      </button>

      <button onClick={() => onTabChange("tools")} style={btnStyle}>
        <Zap style={{ width: 22, height: 22, color: s("tools").color, strokeWidth: s("tools").stroke, fill: activeTab === "tools" ? ACTIVE : "none" }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: s("tools").color, fontWeight: s("tools").weight, letterSpacing: "0.03em" }}>TOOLS</span>
      </button>

      <button onClick={() => onTabChange("profile")} style={btnStyle}>
        <User style={{ width: 22, height: 22, color: s("profile").color, strokeWidth: s("profile").stroke }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: s("profile").color, fontWeight: s("profile").weight, letterSpacing: "0.03em" }}>PROFILE</span>
      </button>
    </div>
  );
}

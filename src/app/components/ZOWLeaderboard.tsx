import { useState, type ComponentType } from "react";
import { Wind, ArrowRight, Leaf, Eye, Heart } from "lucide-react";
import { getZERColor, getZERArousal } from "./ZOWCapture";

interface ZOWLeaderboardProps {
  currentZER: number;
  trigger?: string;
  onContinue: () => void;
  onViewHistory: () => void;
}

function calculateMedian(values: number[]): string {
  if (values.length === 0) return '0.0';
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
  return median.toFixed(1);
}

// Microgrounding exercises shown after ZER capture
const MICROGROUNDING: { title: string; description: string; Icon: ComponentType<{ style?: React.CSSProperties }>; duration: string }[] = [
  { title: '4-7-8 Breath', description: 'Inhale 4s · Hold 7s · Exhale 8s · 3 rounds', Icon: Wind, duration: '2 min' },
  { title: 'Ground in 5', description: 'Name 5 things you see · 4 you touch · 3 you hear', Icon: Leaf, duration: '1 min' },
  { title: 'Orienting', description: 'Slowly look around the room. Let your eyes rest on something pleasant.', Icon: Eye, duration: '1 min' },
  { title: 'Hand on Heart', description: 'Place your hand on your chest. Feel your heartbeat. Breathe slowly.', Icon: Heart, duration: '2 min' },
];

function isOutOfZone(score: number) { return score <= 2 || score >= 6; }

export function ZOWLeaderboard({ currentZER, trigger, onContinue, onViewHistory }: ZOWLeaderboardProps) {
  const [groundingDone, setGroundingDone] = useState(false);

  const history = [4, 3, 4, 5, 3, 4, currentZER];
  const median = calculateMedian(history);

  // Company ZER participation (mock)
  const companyCheckins = 247;
  const totalCompany = 312;
  const companyPct = Math.round((companyCheckins / totalCompany) * 100);
  const zoneBreakdown = [
    { label: 'Hyper arousal', range: '6-7', pct: 18, color: '#F97316' },
    { label: 'Regulates',     range: '3-5', pct: 67, color: '#10B981' },
    { label: 'Hypo arousal',  range: '1-2', pct: 15, color: '#F97316' },
  ];

  const grounding = MICROGROUNDING[Math.abs(currentZER - 1) % MICROGROUNDING.length];

  // Journey SVG data
  const journeyScores = [6,5,4,3,4,3,2,3,4,5,6,5,4,3,2,3,4,5,6,5,4];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-2xl mx-auto py-4">

          {/* Header */}
          <div className="mb-3 text-center">
            <h2 className="text-2xl mb-1" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
              Zone of Emotional Regulation
            </h2>
            <p className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}>7-day journey</p>
            <div className="px-3 py-2 rounded-2xl max-w-lg mx-auto" style={{ background: 'rgba(196,181,253,0.15)', border: '1px solid #C4B5FD' }}>
              <p className="text-xs leading-snug" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280', fontStyle: 'italic' }}>
                💡 Track your emotional baseline and regulation progress over time
              </p>
            </div>
          </div>

          {/* Today card */}
          <div className="p-4 rounded-3xl mb-3" style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #E0E7FF 100%)', border: '2px solid #C4B5FD' }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: getZERColor(currentZER) }}>
                <span className="text-3xl" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'white' }}>{currentZER}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs mb-0.5" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', letterSpacing: '0.05em', fontWeight: 600 }}>TODAY'S ZER</p>
                <p className="text-base mb-1" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Zone of Emotional Regulation</p>
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${getZERColor(currentZER)}22`, color: getZERColor(currentZER), fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  {getZERArousal(currentZER)}
                </span>
              </div>
            </div>
            {/* Named emotion trigger */}
            {trigger && (
              <div className="mt-3 px-3 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#6D28D9' }}>
                  🏷️ <strong>Named feeling:</strong> {trigger}
                </p>
              </div>
            )}
          </div>

          {/* Microgrounding — offered every check-in */}
          {!groundingDone && (
            <div className="p-4 rounded-3xl mb-3" style={{ background: isOutOfZone(currentZER) ? 'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)' : 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', border: `2px solid ${isOutOfZone(currentZER) ? '#FBBF24' : '#6EE7B7'}` }}>
              <p className="text-sm mb-0.5" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
                {isOutOfZone(currentZER) ? '⚡ You\'re outside your regulation zone' : '✨ Keep your regulation going'}
              </p>
              <p className="text-xs mb-3" style={{ fontFamily: 'Inter, sans-serif', color: '#374151', lineHeight: 1.6 }}>
                Try this quick microgrounding exercise to support your nervous system.
              </p>
              <div className="flex items-start gap-3 p-3 rounded-2xl mb-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><grounding.Icon style={{ width: 18, height: 18, color: '#8B5CF6', strokeWidth: 1.75 }} /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#15113C' }}>{grounding.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#EDE9FE', color: '#8B5CF6', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{grounding.duration}</span>
                  </div>
                  <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>{grounding.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setGroundingDone(true)}
                  className="flex-1 py-2.5 rounded-2xl flex items-center justify-center gap-2 text-sm"
                  style={{ background: isOutOfZone(currentZER) ? '#F59E0B' : '#10B981', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                >
                  <Wind className="w-4 h-4" /> Try it now
                </button>
                <button
                  onClick={() => setGroundingDone(true)}
                  className="px-4 py-2.5 rounded-2xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.7)', color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 500, border: '1.5px solid rgba(0,0,0,0.08)' }}
                >
                  Later
                </button>
              </div>
            </div>
          )}

          {/* Journey graph */}
          <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base mb-0.5" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Your ZER Journey</h3>
                <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}>14-day regulation flow</p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-0.5" style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}>Median</p>
                <p className="text-2xl" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#8B5CF6' }}>{median}</p>
              </div>
            </div>

            <svg viewBox="0 0 600 300" className="w-full" style={{ maxHeight: '250px' }}>
              <rect x={40} y={190} width={560} height={90}  fill="#FED7AA" opacity="0.35" />
              <rect x={40} y={100} width={560} height={90}  fill="#D1FAE5" opacity="0.35" />
              <rect x={40} y={20}  width={560} height={80}  fill="#FEF3C7" opacity="0.35" />
              <line x1={40} y1={190} x2={600} y2={190} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4,4" opacity="0.35" />
              <line x1={40} y1={100} x2={600} y2={100} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4,4" opacity="0.35" />
              {[150,280,410,540].map((x,i) => <line key={i} x1={x} y1={20} x2={x} y2={280} stroke="#D1D5DB" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />)}
              <text x={15} y={235} textAnchor="middle" fontSize="8" fill="#F97316" fontFamily="Inter, sans-serif" transform="rotate(-90,15,235)">HYPO</text>
              <text x={15} y={145} textAnchor="middle" fontSize="8" fill="#10B981" fontFamily="Inter, sans-serif" transform="rotate(-90,15,145)">REG.</text>
              <text x={15} y={60}  textAnchor="middle" fontSize="8" fill="#F97316" fontFamily="Inter, sans-serif" transform="rotate(-90,15,60)">HYPER</text>
              {['D1','D4','D7','D10','D14'].map((d,i,a) => (
                <text key={d} x={95 + i * ((560-95)/(a.length-1))} y={293} textAnchor="middle" fontSize="8" fill="#8B5CF6" fontFamily="Inter, sans-serif" fontWeight="600">{d}</text>
              ))}
              {(() => {
                const pts = journeyScores.map((score, idx) => ({ x: 40 + (idx/(journeyScores.length-1))*520, y: 270 - ((score-1)/6)*240, score }));
                let path = `M ${pts[0].x} ${pts[0].y}`;
                for (let i = 1; i < pts.length; i++) path += ` Q ${pts[i-1].x} ${(pts[i-1].y+pts[i].y)/2}, ${pts[i].x} ${pts[i].y}`;
                return (<>
                  <path d={path} fill="none" stroke="#A78BFA" strokeWidth="2" opacity="0.5" />
                  {pts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={6} fill={getZERColor(p.score)} stroke="white" strokeWidth="2" />)}
                </>);
              })()}
            </svg>

            <div className="border-t mt-3 pt-3" style={{ borderColor: '#E5E7EB' }}>
              <button onClick={onViewHistory} className="w-full py-2 rounded-2xl text-xs" style={{ background: 'transparent', border: '2px solid #8B5CF6', color: '#8B5CF6', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                View All Details
              </button>
            </div>
          </div>

          {/* Zone distribution — ZER language only, no good/bad labels */}
          <div className="p-4 rounded-3xl mb-3" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
            <h3 className="text-sm mb-1" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Your ZER Zone Distribution</h3>
            <p className="text-xs mb-3" style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}>Based on your last 14 check-ins</p>
            <div className="space-y-2">
              {zoneBreakdown.map((z) => (
                <div key={z.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: z.color }} />
                      <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C' }}>{z.label} ({z.range})</span>
                    </div>
                    <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', fontWeight: 600 }}>{z.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: '#F3F4F6' }}>
                    <div className="h-full rounded-full" style={{ width: `${z.pct}%`, background: z.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company ZER participation — replaces competitive rank */}
          <div className="p-4 rounded-3xl mb-3" style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #E0E7FF 100%)', border: '2px solid #C4B5FD' }}>
            <h3 className="text-sm mb-3" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>Your Company Today</h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-center">
                <p className="text-3xl" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#8B5CF6' }}>{companyCheckins}</p>
                <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>checked in</p>
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>of {totalCompany} people</p>
                <div className="h-2.5 rounded-full" style={{ background: '#E5E7EB' }}>
                  <div className="h-full rounded-full" style={{ width: `${companyPct}%`, background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }} />
                </div>
                <p className="text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6', fontWeight: 600 }}>{companyPct}% participation today</p>
              </div>
            </div>
            {/* Company zone breakdown */}
            <div className="flex gap-2">
              {zoneBreakdown.map((z) => (
                <div key={z.label} className="flex-1 p-2 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
                  <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: z.color }} />
                  <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: z.color }}>{z.pct}%</p>
                  <p className="leading-tight" style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#9CA3AF' }}>{z.label.split(' ')[0]}</p>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF', fontStyle: 'italic' }}>
              All data is anonymised to protect privacy
            </p>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-3" style={{ background: 'linear-gradient(180deg, rgba(250,245,255,0.8) 0%, rgba(250,245,255,1) 100%)', borderTop: '1px solid rgba(229,231,235,0.3)' }}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onContinue}
            className="w-full py-3 rounded-full flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '15px' }}
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

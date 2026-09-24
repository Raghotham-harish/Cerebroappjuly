import { useState } from "react";
import { Calendar, Filter, ArrowLeft } from "lucide-react";

interface HistoryEntry {
  date: string;
  time: string;
  score: number;
  dayOfWeek: string;
  triggers?: string[];
}

interface SelectedDot {
  entry: HistoryEntry;
  index: number;
}

interface ZOWHistoryProps {
  onBack: () => void;
}

export function ZOWHistory({ onBack }: ZOWHistoryProps) {
  const [selectedRange, setSelectedRange] = useState<'7days' | '14days' | '30days' | '90days' | 'all'>('30days');
  const [selectedDot, setSelectedDot] = useState<SelectedDot | null>(null);

  // Mock comprehensive history data - past 90 days
  const generateHistoryData = (): HistoryEntry[] => {
    const data: HistoryEntry[] = [];
    const today = new Date('2026-04-27');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const numCheckins = Math.floor(Math.random() * 3) + 1; // 1-3 check-ins per day

      for (let j = 0; j < numCheckins; j++) {
        const hour = 8 + Math.floor((j / numCheckins) * 12);
        const minute = Math.floor(Math.random() * 60);
        const score = Math.floor(Math.random() * 7) + 1;
        const hasTrigger = Math.random() < 0.15; // 15% chance of trigger

        data.push({
          date: date.toISOString().split('T')[0],
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          score,
          dayOfWeek: days[date.getDay()],
          triggers: hasTrigger ? ['work stress', 'poor sleep', 'anxiety', 'conflict'][Math.floor(Math.random() * 4)] : undefined
        });
      }
    }

    return data;
  };

  const historyData = generateHistoryData();

  // Filter data based on selected range
  const getFilteredData = () => {
    const today = new Date('2026-04-27');
    let daysToShow = 30;

    switch (selectedRange) {
      case '7days':
        daysToShow = 7;
        break;
      case '14days':
        daysToShow = 14;
        break;
      case '30days':
        daysToShow = 30;
        break;
      case '90days':
        daysToShow = 90;
        break;
      case 'all':
        return historyData;
    }

    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - daysToShow);

    return historyData.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  const filteredData = getFilteredData();

  const getColorForScore = (score: number): string => {
    if (score === 7) return '#F97316';
    if (score === 6) return '#F59E0B';
    if (score >= 3)  return '#10B981';
    if (score === 2) return '#FBBF24';
    return '#F97316';
  };


  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 flex items-center justify-between border-b" style={{ borderColor: '#E5E7EB' }}>
        <button
          onClick={onBack}
          className="cb-btn-icon"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "#15113C" }} />
        </button>
        <h2
          className="text-xl"
          style={{
            fontFamily: 'Lora, serif',
            fontWeight: 500,
            color: '#15113C'
          }}
        >
          ZER Details
        </h2>
        <div className="w-16" />
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-4xl mx-auto py-4">
          {/* Info Card */}
          <div
            className="px-4 py-2 rounded-2xl mb-3"
            style={{
              background: 'rgba(196, 181, 253, 0.15)',
              border: '1px solid #C4B5FD'
            }}
          >
            <p
              className="text-xs leading-relaxed"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6B7280',
                fontStyle: 'italic'
              }}
            >
              Each dot represents a ZER check-in, coloured by your arousal zone. Tap on any dot to see details.
            </p>
          </div>

          {/* Wellness Journey Visualization with Integrated Date Range */}
          <div
            className="rounded-3xl mb-4 overflow-hidden"
            style={{
              background: 'white',
              border: '2px solid #E5E7EB'
            }}
          >
            {/* Date Range Filter Header */}
            <div className="px-4 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#FAFAFA' }}>
              <div className="flex flex-wrap gap-2 items-center">
                <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: '#8B5CF6' }} />
                {[
                  { value: '7days', label: '7D' },
                  { value: '14days', label: '14D' },
                  { value: '30days', label: '30D' },
                  { value: '90days', label: '90D' },
                  { value: 'all', label: 'All' }
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      setSelectedRange(range.value as any);
                      setSelectedDot(null);
                    }}
                    className="px-3 py-1 rounded-full text-xs transition-all"
                    style={{
                      background: selectedRange === range.value
                        ? 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
                        : 'white',
                      color: selectedRange === range.value ? 'white' : '#6B7280',
                      border: `1px solid ${selectedRange === range.value ? '#8B5CF6' : '#D1D5DB'}`,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600
                    }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Graph Container */}
            <div className="p-4">
            <svg
              viewBox="0 0 600 500"
              className="w-full"
              style={{ maxHeight: '400px' }}
            >
              {/* Zone bands: hypo(bottom/orange) → regulates(mid/green) → hyper(top/yellow) */}
              <rect x={40} y={333.33} width={560} height={146.67} fill="#FED7AA" opacity="0.35" />
              <rect x={40} y={186.67} width={560} height={146.66} fill="#D1FAE5" opacity="0.35" />
              <rect x={40} y={40}     width={560} height={146.67} fill="#FEF3C7" opacity="0.35" />

              {/* Horizontal wellness zone dividers */}
              <line x1={40} y1={333.33} x2={600} y2={333.33} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
              <line x1={40} y1={186.67} x2={600} y2={186.67} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />

              {/* Vertical time grid lines */}
              {[150, 250, 350, 450, 550].map((x, i) => (
                <line key={i} x1={x} y1={40} x2={x} y2={480} stroke="#D1D5DB" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
              ))}

              {/* Y-axis wellness labels on left */}
              <text x={15} y={406.67} textAnchor="middle" fontSize="9" fill="#F97316" fontFamily="Inter, sans-serif" transform="rotate(-90, 15, 406.67)">
                HYPO (1-2)
              </text>
              <text x={15} y={260} textAnchor="middle" fontSize="9" fill="#10B981" fontFamily="Inter, sans-serif" transform="rotate(-90, 15, 260)">
                REGULATES (3-5)
              </text>
              <text x={15} y={113.33} textAnchor="middle" fontSize="9" fill="#F97316" fontFamily="Inter, sans-serif" transform="rotate(-90, 15, 113.33)">
                HYPER (6-7)
              </text>

              {/* X-axis time label at bottom */}
              <text x={320} y={495} textAnchor="middle" fontSize="9" fill="#8B5CF6" fontFamily="Inter, sans-serif" letterSpacing="0.1em" fontWeight="600">
                TIME PROGRESSION →
              </text>

              {/* Snake flow with connecting lines */}
              {(() => {
                const positions = filteredData.map((entry, index) => {
                  const x = 40 + (index / Math.max(1, filteredData.length - 1)) * 560;
                  const y = 470 - ((entry.score - 1) / 6) * 430;
                  return { x, y, entry, index };
                });

                // Generate smooth path
                let snakePath = positions.length > 0 ? `M ${positions[0].x} ${positions[0].y}` : '';
                for (let i = 1; i < positions.length; i++) {
                  const prev = positions[i - 1];
                  const curr = positions[i];
                  const midY = (prev.y + curr.y) / 2;
                  snakePath += ` Q ${prev.x} ${midY}, ${curr.x} ${curr.y}`;
                }

                return (
                  <>
                    {/* Connecting path */}
                    {positions.length > 1 && (
                      <path d={snakePath} fill="none" stroke="#A78BFA" strokeWidth="2" opacity="0.5" />
                    )}

                    {/* Dots */}
                    {positions.map((pos) => {
                      const isSelected = selectedDot?.index === pos.index;
                      return (
                        <g
                          key={pos.index}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedDot({ entry: pos.entry, index: pos.index })}
                        >
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={isSelected ? 10 : 7}
                            fill={getColorForScore(pos.entry.score)}
                            stroke="white"
                            strokeWidth={isSelected ? 4 : 2}
                          />
                          {pos.entry.triggers && (
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r={isSelected ? 16 : 12}
                              fill="none"
                              stroke="#EF4444"
                              strokeWidth="2"
                            />
                          )}
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* Selected Dot Details */}
            {selectedDot && (
              <div
                className="mt-3 p-3 rounded-2xl border-t"
                style={{
                  background: 'rgba(139, 92, 246, 0.05)',
                  borderColor: '#E5E7EB'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: getColorForScore(selectedDot.entry.score) }}
                    >
                      <span
                        className="text-lg"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700,
                          color: 'white'
                        }}
                      >
                        {selectedDot.entry.score}
                      </span>
                    </div>
                    <div>
                      <p
                        className="text-sm mb-0.5"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          color: '#15113C'
                        }}
                      >
                        {selectedDot.entry.dayOfWeek}, {selectedDot.entry.date}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#8B5CF6',
                          fontWeight: 600
                        }}
                      >
                        {selectedDot.entry.time}
                      </p>
                    </div>
                  </div>
                  {selectedDot.entry.triggers && (
                    <div
                      className="px-3 py-1 rounded-full"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #FCA5A5'
                      }}
                    >
                      <span
                        className="text-xs"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#DC2626',
                          fontWeight: 600
                        }}
                      >
                        {selectedDot.entry.triggers}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Stats Summary */}
          <div
            className="p-4 rounded-3xl mb-3"
            style={{
              background: 'linear-gradient(135deg, #EDE9FE 0%, #E0E7FF 100%)',
              border: '2px solid #C4B5FD'
            }}
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xl mb-0.5" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
                  {filteredData.length}
                </p>
                <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
                  Check-ins
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl mb-0.5" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
                  {(() => {
                    if (filteredData.length === 0) return '0.0';
                    const sorted = [...filteredData].sort((a, b) => a.score - b.score);
                    const mid = Math.floor(sorted.length / 2);
                    return (sorted.length % 2 !== 0
                      ? sorted[mid].score
                      : (sorted[mid - 1].score + sorted[mid].score) / 2
                    ).toFixed(1);
                  })()}
                </p>
                <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
                  Median
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl mb-0.5" style={{ fontFamily: 'Lora, serif', fontWeight: 600, color: '#15113C' }}>
                  {filteredData.filter(e => e.triggers).length}
                </p>
                <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
                  Triggers
                </p>
              </div>
            </div>
          </div>

          {/* All Triggers List */}
          {filteredData.filter(e => e.triggers).length > 0 && (
            <div
              className="p-4 rounded-3xl"
              style={{
                background: 'white',
                border: '2px solid #E5E7EB'
              }}
            >
              <h3
                className="text-sm mb-3"
                style={{
                  fontFamily: 'Lora, serif',
                  fontWeight: 500,
                  color: '#15113C'
                }}
              >
                Recent Triggers ({filteredData.filter(e => e.triggers).length})
              </h3>

              <div className="space-y-2">
                {filteredData
                  .filter(e => e.triggers)
                  .slice(0, 10)
                  .map((entry, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-xl flex items-center justify-between"
                      style={{
                        background: 'rgba(254, 226, 226, 0.5)',
                        border: '1px solid #FCA5A5'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: getColorForScore(entry.score) }}
                        >
                          <span
                            className="text-xs"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 700,
                              color: 'white'
                            }}
                          >
                            {entry.score}
                          </span>
                        </div>
                        <span
                          className="text-xs"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            color: '#15113C',
                            fontWeight: 600
                          }}
                        >
                          {entry.triggers}
                        </span>
                      </div>
                      <span
                        className="text-xs"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#9CA3AF'
                        }}
                      >
                        {entry.date} {entry.time}
                      </span>
                    </div>
                  ))}
              </div>

              {filteredData.filter(e => e.triggers).length > 10 && (
                <p
                  className="text-xs mt-2 text-center"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#9CA3AF',
                    fontStyle: 'italic'
                  }}
                >
                  Showing 10 of {filteredData.filter(e => e.triggers).length} triggers
                </p>
              )}
            </div>
          )}

          <div className="pb-4" />
        </div>
      </div>
    </div>
  );
}

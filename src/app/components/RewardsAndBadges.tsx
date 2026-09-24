import { useState, type ComponentType } from "react";
import { AnimatedLogo } from "./AnimatedLogo";
import { Award, TrendingUp, Flame, Star, Lock, CheckCircle, Target, Zap, Brain, Sparkles, Eye, BadgeCheck } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  Icon: ComponentType<{ style?: React.CSSProperties }>;
  category: 'daily' | 'personal' | 'spiritual' | 'creative' | 'special';
  pointsRequired: number;
  unlocked: boolean;
  unlockedDate?: string;
}

interface RewardsAndBadgesProps {
  userName: string;
  totalPoints: number;
  currentStreak: number;
  onClose: () => void;
}

export function RewardsAndBadges({ userName, totalPoints, currentStreak, onClose }: RewardsAndBadgesProps) {
  const [selectedTab, setSelectedTab] = useState<'badges' | 'streaks' | 'milestones'>('badges');

  // Sample badges - admin configurable
  const badges: Badge[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first daily intention',
      Icon: Target,
      category: 'special',
      pointsRequired: 5,
      unlocked: totalPoints >= 5,
      unlockedDate: totalPoints >= 5 ? '2026-05-10' : undefined
    },
    {
      id: '2',
      name: 'Productivity Master',
      description: 'Achieve 150+ points in productivity goals',
      Icon: Zap,
      category: 'daily',
      pointsRequired: 150,
      unlocked: totalPoints >= 150
    },
    {
      id: '3',
      name: 'Meditation Champion',
      description: 'Complete 30 days of meditation practice',
      Icon: Brain,
      category: 'spiritual',
      pointsRequired: 150,
      unlocked: false
    },
    {
      id: '4',
      name: 'Creative Spark',
      description: 'Unlock creative potential through consistent practice',
      Icon: Sparkles,
      category: 'creative',
      pointsRequired: 150,
      unlocked: false
    },
    {
      id: '5',
      name: 'Self-Aware',
      description: 'Achieve deep self-awareness milestones',
      Icon: Eye,
      category: 'personal',
      pointsRequired: 150,
      unlocked: false
    },
    {
      id: '6',
      name: '5-Day Warrior',
      description: 'Maintain a 5-day streak (2x points active)',
      Icon: Flame,
      category: 'special',
      pointsRequired: 25,
      unlocked: currentStreak >= 5
    },
    {
      id: '7',
      name: 'Centurion',
      description: 'Earn 100 total points',
      Icon: BadgeCheck,
      category: 'special',
      pointsRequired: 100,
      unlocked: totalPoints >= 100
    },
    {
      id: '8',
      name: 'Enlightened',
      description: 'Reach 500 total points across all pillars',
      Icon: Star,
      category: 'special',
      pointsRequired: 500,
      unlocked: totalPoints >= 500
    }
  ];

  // Calculate quarterly profile unlock
  const profileUnlockPercentage = Math.min(Math.floor((totalPoints / 500) * 20), 20);
  const nextQuarterUnlock = Math.ceil((totalPoints + 1) / 125) * 125;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily': return '#F59E0B';
      case 'personal': return '#3B82F6';
      case 'spiritual': return '#10B981';
      case 'creative': return '#8B5CF6';
      case 'special': return '#EC4899';
      default: return '#6B7280';
    }
  };

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 50%, #EBF8FF 100%)'
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 flex items-center justify-between border-b" style={{ borderColor: '#E5E7EB' }}>
        <button
          onClick={onClose}
          className="text-base"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#8B5CF6',
            fontWeight: 600
          }}
        >
          ← Back
        </button>
        <h2
          className="text-xl"
          style={{
            fontFamily: 'Lora, serif',
            fontWeight: 500,
            color: '#15113C'
          }}
        >
          Rewards
        </h2>
        <div className="w-16" />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-4">
          <div className="max-w-2xl mx-auto py-6">
            {/* Points Summary */}
            <div
              className="p-6 rounded-3xl mb-6"
              style={{
                background: 'linear-gradient(135deg, #EDE9FE 0%, #E0E7FF 100%)',
                border: '2px solid #C4B5FD'
              }}
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p
                    className="text-3xl mb-1"
                    style={{
                      fontFamily: 'Lora, serif',
                      fontWeight: 700,
                      color: '#8B5CF6'
                    }}
                  >
                    {totalPoints}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280'
                    }}
                  >
                    Total Points
                  </p>
                </div>
                <div>
                  <p
                    className="text-3xl mb-1"
                    style={{
                      fontFamily: 'Lora, serif',
                      fontWeight: 700,
                      color: '#F59E0B'
                    }}
                  >
                    {currentStreak}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280'
                    }}
                  >
                    Day Streak
                  </p>
                </div>
                <div>
                  <p
                    className="text-3xl mb-1"
                    style={{
                      fontFamily: 'Lora, serif',
                      fontWeight: 700,
                      color: '#10B981'
                    }}
                  >
                    {unlockedBadges.length}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280'
                    }}
                  >
                    Badges Earned
                  </p>
                </div>
              </div>

              {/* Streak Multiplier Notice */}
              {currentStreak >= 5 && (
                <div
                  className="mt-4 p-3 rounded-2xl text-center"
                  style={{
                    background: 'rgba(251, 146, 60, 0.2)',
                    border: '1px solid #F59E0B'
                  }}
                >
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#D97706',
                      fontWeight: 600
                    }}
                  >
                    2x Points Active! Keep your streak going!
                  </p>
                </div>
              )}
            </div>

            {/* Profile Unlock Progress */}
            <div
              className="p-6 rounded-3xl mb-6"
              style={{
                background: 'white',
                border: '2px solid #E5E7EB'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-base"
                  style={{
                    fontFamily: 'Lora, serif',
                    fontWeight: 600,
                    color: '#15113C'
                  }}
                >
                  Profile Unlock Progress
                </h3>
                <span
                  className="text-sm"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#8B5CF6',
                    fontWeight: 700
                  }}
                >
                  {profileUnlockPercentage}%
                </span>
              </div>
              <div className="h-3 rounded-full mb-2" style={{ background: '#F3F4F6' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(profileUnlockPercentage / 20) * 100}%`,
                    background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
                  }}
                />
              </div>
              <p
                className="text-xs text-center"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#9CA3AF'
                }}
              >
                Next unlock at {nextQuarterUnlock} points (Quarterly: 20% total unlocking)
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { id: 'badges', label: 'Badges', icon: Award },
                { id: 'streaks', label: 'Streaks', icon: Flame },
                { id: 'milestones', label: 'Milestones', icon: Star }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className="flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: selectedTab === tab.id
                        ? 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
                        : 'white',
                      color: selectedTab === tab.id ? 'white' : '#6B7280',
                      border: `2px solid ${selectedTab === tab.id ? '#8B5CF6' : '#E5E7EB'}`,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Badges Tab */}
            {selectedTab === 'badges' && (
              <>
                {/* Unlocked Badges */}
                {unlockedBadges.length > 0 && (
                  <div className="mb-6">
                    <h3
                      className="text-base mb-3"
                      style={{
                        fontFamily: 'Lora, serif',
                        fontWeight: 600,
                        color: '#15113C'
                      }}
                    >
                      Unlocked ({unlockedBadges.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {unlockedBadges.map((badge) => (
                        <div
                          key={badge.id}
                          className="p-4 rounded-2xl text-center"
                          style={{
                            background: 'white',
                            border: `2px solid ${getCategoryColor(badge.category)}`
                          }}
                        >
                          <div
                            className="mb-2 w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                            style={{ background: `${getCategoryColor(badge.category)}20` }}
                          >
                            <badge.Icon style={{ width: 28, height: 28, color: getCategoryColor(badge.category), strokeWidth: 1.5 }} />
                          </div>
                          <p
                            className="text-sm mb-1"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 600,
                              color: '#15113C'
                            }}
                          >
                            {badge.name}
                          </p>
                          <p
                            className="text-xs mb-2"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              color: '#9CA3AF'
                            }}
                          >
                            {badge.description}
                          </p>
                          {badge.unlockedDate && (
                            <p
                              className="text-xs"
                              style={{
                                fontFamily: 'Inter, sans-serif',
                                color: getCategoryColor(badge.category),
                                fontWeight: 600
                              }}
                            >
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              Unlocked
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked Badges */}
                {lockedBadges.length > 0 && (
                  <div>
                    <h3
                      className="text-base mb-3"
                      style={{
                        fontFamily: 'Lora, serif',
                        fontWeight: 600,
                        color: '#15113C'
                      }}
                    >
                      Locked ({lockedBadges.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {lockedBadges.map((badge) => (
                        <div
                          key={badge.id}
                          className="p-4 rounded-2xl text-center opacity-60"
                          style={{
                            background: '#F9FAFB',
                            border: '2px solid #E5E7EB'
                          }}
                        >
                          <div
                            className="text-4xl mb-2 w-16 h-16 mx-auto rounded-full flex items-center justify-center relative"
                            style={{ background: '#E5E7EB' }}
                          >
                            <Lock className="w-6 h-6" style={{ color: '#9CA3AF' }} />
                          </div>
                          <p
                            className="text-sm mb-1"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 600,
                              color: '#6B7280'
                            }}
                          >
                            {badge.name}
                          </p>
                          <p
                            className="text-xs mb-2"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              color: '#9CA3AF'
                            }}
                          >
                            {badge.description}
                          </p>
                          <p
                            className="text-xs"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              color: '#9CA3AF',
                              fontWeight: 600
                            }}
                          >
                            Requires {badge.pointsRequired} pts
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Streaks Tab */}
            {selectedTab === 'streaks' && (
              <div
                className="p-6 rounded-3xl text-center"
                style={{
                  background: 'white',
                  border: '2px solid #E5E7EB'
                }}
              >
                <Flame className="w-16 h-16 mx-auto mb-4" style={{ color: currentStreak >= 5 ? '#F59E0B' : '#9CA3AF' }} />
                <p
                  className="text-5xl mb-2"
                  style={{
                    fontFamily: 'Lora, serif',
                    fontWeight: 700,
                    color: '#F59E0B'
                  }}
                >
                  {currentStreak}
                </p>
                <p
                  className="text-base mb-4"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#6B7280'
                  }}
                >
                  Day Streak
                </p>
                <p
                  className="text-sm"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#9CA3AF'
                  }}
                >
                  {currentStreak >= 5
                    ? '🎉 You\'re earning 2x points! Keep going!'
                    : `${5 - currentStreak} more days to unlock 2x multiplier`}
                </p>
              </div>
            )}

            {/* Milestones Tab */}
            {selectedTab === 'milestones' && (
              <div className="space-y-3">
                {[
                  { points: 50, label: 'Beginner', achieved: totalPoints >= 50 },
                  { points: 100, label: 'Intermediate', achieved: totalPoints >= 100 },
                  { points: 250, label: 'Advanced', achieved: totalPoints >= 250 },
                  { points: 500, label: 'Expert', achieved: totalPoints >= 500 },
                  { points: 1000, label: 'Master', achieved: totalPoints >= 1000 }
                ].map((milestone) => (
                  <div
                    key={milestone.points}
                    className="p-4 rounded-2xl flex items-center justify-between"
                    style={{
                      background: milestone.achieved ? 'linear-gradient(135deg, #EDE9FE 0%, #E0E7FF 100%)' : 'white',
                      border: `2px solid ${milestone.achieved ? '#8B5CF6' : '#E5E7EB'}`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: milestone.achieved ? '#8B5CF6' : '#E5E7EB'
                        }}
                      >
                        {milestone.achieved ? (
                          <Star className="w-5 h-5" style={{ color: 'white' }} fill="white" />
                        ) : (
                          <Lock className="w-5 h-5" style={{ color: '#9CA3AF' }} />
                        )}
                      </div>
                      <div>
                        <p
                          className="text-base mb-1"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            color: milestone.achieved ? '#8B5CF6' : '#6B7280'
                          }}
                        >
                          {milestone.label}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            color: '#9CA3AF'
                          }}
                        >
                          {milestone.points} points
                        </p>
                      </div>
                    </div>
                    {milestone.achieved && (
                      <CheckCircle className="w-6 h-6" style={{ color: '#10B981' }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pb-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

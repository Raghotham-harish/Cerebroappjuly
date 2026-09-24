import { useEffect, useState } from "react";
import { Sparkles, Lightbulb } from "lucide-react";

interface InsightReelScreenProps {
  type: 'insight' | 'did-you-know';
  title?: string;
  description?: string;
  highlight?: string;
  fact?: string;
  backgroundMedia?: string; // URL for image or video
  onComplete: () => void;
}

export function InsightReelScreen({ 
  type, 
  title, 
  description, 
  highlight, 
  fact, 
  backgroundMedia,
  onComplete 
}: InsightReelScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 10000; // 10 seconds
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Auto-advance when progress is complete
          setTimeout(() => onComplete(), 300);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Default nature images if no backgroundMedia provided
  const defaultBackgrounds = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // Mountain landscape
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', // Forest
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&q=80', // Sunset lake
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80', // Nature path
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80', // Flowers
  ];

  const background = backgroundMedia || defaultBackgrounds[Math.floor(Math.random() * defaultBackgrounds.length)];

  return (
    <div 
      className="fixed inset-0 flex flex-col"
      style={{ 
        zIndex: 1000,
        background: '#FAFAFA'
      }}
    >
      {/* Progress Bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'rgba(0, 0, 0, 0.1)',
          zIndex: 10
        }}
      >
        <div 
          className="h-full transition-all"
          style={{
            width: `${progress}%`,
            background: type === 'insight' ? '#8B5CF6' : '#F59E0B'
          }}
        />
      </div>

      {/* Top Half - Image/Video */}
      <div 
        className="flex-1 relative overflow-hidden"
        style={{ minHeight: '50%' }}
      >
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Very light gradient overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: type === 'insight' 
              ? 'linear-gradient(to bottom, rgba(139, 92, 246, 0.15) 0%, rgba(250, 250, 250, 1) 100%)'
              : 'linear-gradient(to bottom, rgba(245, 158, 11, 0.15) 0%, rgba(250, 250, 250, 1) 100%)'
          }}
        />
      </div>

      {/* Bottom Half - Content */}
      <div 
        className="flex-1 relative flex flex-col px-6 pt-8 pb-6"
        style={{ 
          background: '#FAFAFA',
          minHeight: '50%'
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ 
              background: type === 'insight' 
                ? 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)'
                : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
            }}
          >
            {type === 'insight' ? (
              <Sparkles className="w-7 h-7" style={{ color: '#8B5CF6' }} />
            ) : (
              <Lightbulb className="w-7 h-7" style={{ color: '#F59E0B' }} fill="#F59E0B" />
            )}
          </div>
        </div>

        {/* Content based on type */}
        <div className="flex-1 flex flex-col items-center justify-start text-center">
          {type === 'insight' && (
            <>
              <p 
                className="text-xs mb-3 tracking-wider"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: '#8B5CF6',
                  fontWeight: 600
                }}
              >
                YOUR INSIGHT
              </p>
              <h2 
                className="text-2xl mb-4"
                style={{ 
                  fontFamily: 'Lora, serif',
                  fontWeight: 500,
                  color: '#15113C',
                  lineHeight: 1.3
                }}
              >
                {title}
              </h2>
              <p 
                className="text-base mb-4 leading-relaxed max-w-md"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: '#6B7280'
                }}
              >
                {description}
              </p>
              {highlight && (
                <div 
                  className="inline-block px-5 py-2.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
                    color: '#8B5CF6',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  {highlight}
                </div>
              )}
            </>
          )}

          {type === 'did-you-know' && (
            <>
              <p 
                className="text-xs mb-3 tracking-wider"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: '#F59E0B',
                  fontWeight: 600
                }}
              >
                DID YOU KNOW?
              </p>
              <p 
                className="text-lg leading-relaxed max-w-md"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: '#15113C',
                  fontWeight: 400
                }}
              >
                {fact}
              </p>
            </>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={onComplete}
          className="w-full py-4 rounded-full mt-6"
          style={{
            background: type === 'insight' 
              ? 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
              : 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
            fontFamily: 'Inter, sans-serif',
            color: 'white',
            fontSize: '15px',
            fontWeight: 600,
            border: 'none'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
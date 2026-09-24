import { useState, useRef, useEffect } from "react";
import { X, Sparkles, RotateCcw } from "lucide-react";

interface ZenSandGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

export function ZenSandGame({ onClose, onComplete }: ZenSandGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pattern, setPattern] = useState<"waves" | "circles" | "spiral" | "zen">("waves");
  const [breathCount, setBreathCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#FCE7F3");
    gradient.addColorStop(1, "#FBCFE8");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const { x, y } = coords;

    ctx.strokeStyle = "#EC4899";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.6;

    if (pattern === "waves") {
      ctx.beginPath();
      for (let i = 0; i < 20; i++) {
        const offsetX = Math.sin(y / 20 + i) * 10;
        ctx.lineTo(x + offsetX, y + i * 2);
      }
      ctx.stroke();
    } else if (pattern === "circles") {
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.stroke();
    } else if (pattern === "spiral") {
      ctx.beginPath();
      for (let i = 0; i < 50; i++) {
        const angle = 0.1 * i;
        const radius = 2 * i;
        const spiralX = x + radius * Math.cos(angle);
        const spiralY = y + radius * Math.sin(angle);
        ctx.lineTo(spiralX, spiralY);
      }
      ctx.stroke();
    } else if (pattern === "zen") {
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(x + Math.random() * 20 - 10, y + Math.random() * 20 - 10, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#FCE7F3");
    gradient.addColorStop(1, "#FBCFE8");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setBreathCount(prev => prev + 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}>
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #E5E7EB' }}>
          <X className="w-5 h-5" style={{ color: '#6B7280' }} />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: '#EC4899' }} />
          <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#EC4899', fontWeight: 600 }}>
            {formatTime(sessionTime)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-center text-sm mb-3" style={{ fontFamily: 'Inter, sans-serif', color: '#9D174D', fontWeight: 500 }}>
          Draw slowly and mindfully
        </p>

        <div className="flex gap-2 mb-3 justify-center">
          {(["waves", "circles", "spiral", "zen"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPattern(p)}
              className="px-3 py-1.5 rounded-full text-xs transition-all"
              style={{
                background: pattern === p ? 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)' : 'rgba(255,255,255,0.7)',
                color: pattern === p ? 'white' : '#9D174D',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                border: pattern === p ? 'none' : '1px solid #F9A8D4'
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={clearCanvas}
          className="w-full py-2 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 mb-3"
          style={{ background: 'rgba(255,255,255,0.8)', border: '2px solid #F9A8D4', color: '#9D174D', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
        >
          <RotateCcw className="w-4 h-4" />
          Clear & Breathe ({breathCount})
        </button>
      </div>

      <div className="flex-1 px-4 pb-4">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full rounded-3xl"
          style={{
            border: '3px solid #F9A8D4',
            touchAction: 'none',
            cursor: 'crosshair'
          }}
        />
      </div>

      <div className="p-4">
        <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
          <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#9D174D' }}>
            Focus on the movement. Let thoughts pass like sand.
          </p>
        </div>
      </div>
    </div>
  );
}

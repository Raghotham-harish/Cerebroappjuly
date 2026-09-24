import { useState, useEffect } from "react";
import { Mic, X } from "lucide-react";
import { Button } from "./ui/button";

interface MockPermissionDialogProps {
  onAllow: () => void;
  onDeny: () => void;
}

export function MockPermissionDialog({ onAllow, onDeny }: MockPermissionDialogProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-allow after 1.5 seconds for mock purposes
    const timer = setTimeout(() => {
      setIsVisible(false);
      onAllow();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onAllow]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-4 animate-in slide-in-from-top-4 duration-300">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              crebrο.com wants to:
            </h3>
            <p className="text-sm text-gray-700 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              Use your microphone
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsVisible(false);
                  onDeny();
                }}
                variant="outline"
                size="sm"
                className="text-xs bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg h-8"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Block
              </Button>
              <Button
                onClick={() => {
                  setIsVisible(false);
                  onAllow();
                }}
                size="sm"
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-8"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Allow
              </Button>
            </div>
          </div>
          
          <button
            onClick={() => {
              setIsVisible(false);
              onDeny();
            }}
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            <strong>Mock Mode:</strong> This is a simulated permission dialog. In production, the browser's native dialog will appear.
          </p>
        </div>
      </div>
    </div>
  );
}

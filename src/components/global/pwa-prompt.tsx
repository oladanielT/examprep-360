import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Share, Plus, Download, X } from "lucide-react";
// @ts-ignore
import { useRegisterSW } from "virtual:pwa-register/react";

export function PWAPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ', r)
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error)
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast("Update Available", {
        description: "A new version of Exam Prep 360 is available.",
        action: {
          label: "Refresh",
          onClick: () => updateServiceWorker(true),
        },
        duration: Infinity,
      });
    }
  }, [needRefresh, updateServiceWorker]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone);
    setIsStandalone(!!isStandaloneMode);

    if (isIOSDevice && !isStandaloneMode) {
      // Don't show immediately, maybe wait a bit or check if they dismissed it before
      const hasDismissed = localStorage.getItem('ios-pwa-dismissed');
      if (!hasDismissed) {
        setShowIOSPrompt(true);
      }
    }
  }, []);

  if (isOffline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm font-medium z-50">
        You are offline. Some features may not be available.
      </div>
    );
  }

  if (isIOS && !isStandalone && showIOSPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl p-4 border border-gray-100 z-50 animate-in slide-in-from-bottom-5">
        <button 
          onClick={() => {
            setShowIOSPrompt(false);
            localStorage.setItem('ios-pwa-dismissed', 'true');
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-start gap-4">
          <div className="bg-accent/10 p-3 rounded-lg text-accent">
            <Download className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Install ExamPrep 360</h3>
            <p className="text-sm text-gray-600 mt-1">
              Install this app on your iPhone for the best experience.
            </p>
            <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg flex flex-col gap-2">
              <div className="flex items-center gap-2">
                1. Tap the <Share className="w-4 h-4 text-blue-500" /> Share button below
              </div>
              <div className="flex items-center gap-2">
                2. Tap <Plus className="w-4 h-4 text-gray-700" /> Add to Home Screen
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

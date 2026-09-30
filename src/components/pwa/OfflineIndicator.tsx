import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <aside
      aria-label="Offline Mode Notification"
      className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-xs font-semibold px-4 py-2 shadow-md flex items-center justify-between animate-in slide-in-from-top duration-200"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-200 shrink-0" />
          <span>
            <strong>Offline Mode:</strong> Reconnect to see latest opportunities. Showing cached data.
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    </aside>
  );
};

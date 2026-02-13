import { RefreshCw, Zap, Wifi, WifiOff } from 'lucide-react';

interface DashboardHeaderProps {
  lastUpdate: Date | null;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  loading: boolean;
  apiStatus: 'connected' | 'disconnected' | 'checking';
}

const DashboardHeader = ({ lastUpdate, autoRefresh, onToggleAutoRefresh, onRefresh, loading, apiStatus }: DashboardHeaderProps) => {
  return (
    <div className="header-glass sticky top-0 z-50 -mx-4 md:-mx-6 -mt-4 md:-mt-6 px-4 md:px-6 py-4 mb-2 animate-fade-in">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            {apiStatus === 'connected' && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-profit border-2 border-background animate-pulse-dot" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Risk Dashboard</h1>
            <p className="text-[11px] text-muted-foreground">Real-time broker exposure & risk monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* API Status pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-500 ${
            apiStatus === 'connected'
              ? 'bg-profit/10 text-profit border border-profit/20'
              : apiStatus === 'checking'
                ? 'bg-warning/10 text-warning border border-warning/20'
                : 'bg-loss/10 text-loss border border-loss/20'
          }`}>
            {apiStatus === 'connected' ? <Wifi className="h-3 w-3" /> : apiStatus === 'checking' ? <Wifi className="h-3 w-3 animate-pulse" /> : <WifiOff className="h-3 w-3" />}
            {apiStatus === 'connected' ? 'Live' : apiStatus === 'checking' ? 'Connecting' : 'Offline'}
          </div>

          {/* Time */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-secondary border border-border">
            <div className="w-1 h-1 rounded-full bg-muted-foreground animate-pulse-dot" />
            <span className="text-[10px] text-muted-foreground font-mono">
              {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
            </span>
          </div>

          {/* Auto-refresh */}
          <button
            onClick={onToggleAutoRefresh}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 hover:scale-105 active:scale-95 ${
              autoRefresh
                ? 'bg-primary/15 border-primary/30 text-primary shadow-glow'
                : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary/20'
            }`}
          >
            {autoRefresh ? '⏸ Live' : '▶ Paused'}
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-full border border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 disabled:opacity-30 hover:scale-105 active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

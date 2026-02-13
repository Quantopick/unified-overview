import { RefreshCw } from 'lucide-react';

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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Risk Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time broker exposure & risk monitoring</p>
      </div>
      <div className="flex items-center gap-3">
        {/* API Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary border border-border">
          <div className={`w-1.5 h-1.5 rounded-full ${
            apiStatus === 'connected' ? 'bg-profit animate-pulse-dot' :
            apiStatus === 'checking' ? 'bg-warning animate-pulse-dot' :
            'bg-loss'
          }`} />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {apiStatus === 'connected' ? 'Live' : apiStatus === 'checking' ? 'Connecting...' : 'Offline'}
          </span>
        </div>

        {/* Last update */}
        <span className="text-[10px] text-muted-foreground font-mono">
          {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
        </span>

        {/* Auto-refresh toggle */}
        <button
          onClick={onToggleAutoRefresh}
          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border transition-all ${
            autoRefresh
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {autoRefresh ? '⏸ Live' : '▶ Paused'}
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-md border border-border bg-secondary text-muted-foreground hover:text-foreground transition-all disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;

import type { RiskSummary, RiskClient } from '@/lib/api';

interface RiskOverviewProps {
  summary: RiskSummary | null;
  clients: RiskClient[];
  loading: boolean;
}

const RISK_LEVELS = [
  { key: 'EXTREME', label: 'Extreme', icon: '🔴', colorClass: 'text-loss' },
  { key: 'HIGH', label: 'High', icon: '🟠', colorClass: 'text-warning' },
  { key: 'MEDIUM', label: 'Medium', icon: '🟡', colorClass: 'text-info' },
  { key: 'LOW', label: 'Low', icon: '🟢', colorClass: 'text-profit' },
] as const;

const RiskOverview = ({ summary, clients, loading }: RiskOverviewProps) => {
  const topRiskClients = clients
    .filter(c => c.risk_level === 'EXTREME' || c.risk_level === 'HIGH')
    .slice(0, 6);

  return (
    <div className="rounded-lg border border-border bg-gradient-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>🛡️</span> Risk Monitor
        </h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {summary?.total_clients ?? 0} monitored
        </span>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 rounded animate-shimmer" />)}</div>
      ) : (
        <>
          {/* Risk distribution bars */}
          <div className="px-4 py-3 space-y-2">
            {RISK_LEVELS.map(({ key, label, icon, colorClass }) => {
              const count = summary?.risk_distribution?.[key as keyof typeof summary.risk_distribution] ?? 0;
              const total = summary?.total_clients ?? 1;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-20 flex items-center gap-1.5 shrink-0">
                    <span className="text-xs">{icon}</span>
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        key === 'EXTREME' ? 'bg-loss' :
                        key === 'HIGH' ? 'bg-warning' :
                        key === 'MEDIUM' ? 'bg-info' : 'bg-profit'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`font-mono text-xs font-semibold w-8 text-right ${colorClass}`}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* High risk clients */}
          {topRiskClients.length > 0 && (
            <div className="border-t border-border px-4 py-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">High Risk Clients</span>
              <div className="mt-2 space-y-1">
                {topRiskClients.map(c => (
                  <div key={c.login} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{c.risk_level === 'EXTREME' ? '🔴' : '🟠'}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{c.login}</span>
                      <span className="text-[11px] text-foreground truncate max-w-[100px]">{c.name || '—'}</span>
                    </div>
                    <span className={`font-mono text-[11px] font-semibold ${
                      c.risk_level === 'EXTREME' ? 'text-loss' : 'text-warning'
                    }`}>
                      {c.total_score.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RiskOverview;

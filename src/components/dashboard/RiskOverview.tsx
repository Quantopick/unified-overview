import { useState } from 'react';
import type { RiskSummary, RiskClient } from '@/lib/api';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface RiskOverviewProps {
  summary: RiskSummary | null;
  clients: RiskClient[];
  loading: boolean;
}

const RISK_LEVELS = [
  { key: 'EXTREME', label: 'Extreme', icon: '🔴', colorClass: 'text-loss', barClass: 'bg-loss' },
  { key: 'HIGH', label: 'High', icon: '🟠', colorClass: 'text-warning', barClass: 'bg-warning' },
  { key: 'MEDIUM', label: 'Medium', icon: '🟡', colorClass: 'text-info', barClass: 'bg-info' },
  { key: 'LOW', label: 'Low', icon: '🟢', colorClass: 'text-profit', barClass: 'bg-profit' },
] as const;

const RiskOverview = ({ summary, clients, loading }: RiskOverviewProps) => {
  const [expanded, setExpanded] = useState(true);
  const topRiskClients = clients
    .filter(c => c.risk_level === 'EXTREME' || c.risk_level === 'HIGH')
    .slice(0, 6);

  return (
    <div className="card-interactive overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div className="section-header">
        <h3 className="section-title">
          <div className="w-6 h-6 rounded-md bg-warning/15 flex items-center justify-center">
            <Shield className="h-3.5 w-3.5 text-warning" />
          </div>
          Risk Monitor
        </h3>
        <span className="section-badge">{summary?.total_clients ?? 0} monitored</span>
      </div>

      {loading ? (
        <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />)}</div>
      ) : (
        <>
          {/* Risk donut-style cards */}
          <div className="p-4 grid grid-cols-2 gap-2">
            {RISK_LEVELS.map(({ key, label, icon, colorClass, barClass }) => {
              const count = summary?.risk_distribution?.[key as keyof typeof summary.risk_distribution] ?? 0;
              const total = summary?.total_clients ?? 1;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={key} className="group rounded-lg bg-secondary/50 border border-border/50 p-3 hover:bg-accent/40 transition-all duration-200 cursor-default hover:border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{icon}</span>
                      <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
                    </div>
                    <span className={`font-mono text-base font-bold ${colorClass} transition-transform duration-200 group-hover:scale-110`}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full bar-animated ${barClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[9px] text-muted-foreground/60 font-mono">{pct}%</div>
                </div>
              );
            })}
          </div>

          {/* Expandable high risk clients */}
          {topRiskClients.length > 0 && (
            <div className="border-t border-border">
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-5 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold hover:bg-accent/30 transition-colors"
              >
                <span>⚠ High Risk Clients ({topRiskClients.length})</span>
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pb-3 space-y-1">
                  {topRiskClients.map((c, idx) => (
                    <div
                      key={c.login}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-accent/40 transition-all duration-200 cursor-default animate-fade-in"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{c.risk_level === 'EXTREME' ? '🔴' : '🟠'}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{c.login}</span>
                        <span className="text-[11px] text-foreground truncate max-w-[90px]">{c.name || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full bar-animated ${c.risk_level === 'EXTREME' ? 'bg-loss' : 'bg-warning'}`} style={{ width: `${Math.min(c.total_score, 100)}%` }} />
                        </div>
                        <span className={`font-mono text-[11px] font-bold min-w-[32px] text-right ${c.risk_level === 'EXTREME' ? 'text-loss' : 'text-warning'}`}>
                          {c.total_score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RiskOverview;

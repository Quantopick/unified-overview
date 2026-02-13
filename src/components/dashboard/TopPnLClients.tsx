import { formatCurrency } from '@/lib/api';
import type { ClientPnL } from '@/lib/api';

interface TopPnLClientsProps {
  data: ClientPnL[];
  loading: boolean;
}

const TopPnLClients = ({ data, loading }: TopPnLClientsProps) => {
  const winners = data.filter(c => c.pnl > 0).slice(0, 8);
  const losers = [...data].filter(c => c.pnl < 0).sort((a, b) => a.pnl - b.pnl).slice(0, 8);

  const maxAbsPnl = Math.max(
    ...winners.map(c => Math.abs(c.pnl)),
    ...losers.map(c => Math.abs(c.pnl)),
    1
  );

  const renderClient = (client: ClientPnL, type: 'winner' | 'loser') => {
    const barWidth = Math.min((Math.abs(client.pnl) / maxAbsPnl) * 100, 100);
    return (
      <div key={client.login} className="flex items-center gap-3 py-1.5 px-3 hover:bg-accent/40 transition-colors rounded">
        <div className="w-14 shrink-0">
          <span className="font-mono text-[11px] text-muted-foreground">{client.login}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-foreground truncate">{client.name || '—'}</div>
          <div className="mt-0.5 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${type === 'winner' ? 'bg-profit' : 'bg-loss'}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
        <div className={`font-mono text-xs font-semibold shrink-0 ${type === 'winner' ? 'text-profit' : 'text-loss'}`}>
          {type === 'winner' ? '+' : ''}{formatCurrency(client.pnl, true)}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Winners */}
      <div className="rounded-lg border border-border bg-gradient-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="text-profit">📈</span> Top Winners
          </h3>
          <span className="text-[10px] text-profit font-mono">{winners.length} clients</span>
        </div>
        <div className="py-1 max-h-[280px] overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-6 rounded animate-shimmer" />)}</div>
          ) : winners.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">No profitable clients</div>
          ) : (
            winners.map(c => renderClient(c, 'winner'))
          )}
        </div>
      </div>

      {/* Losers */}
      <div className="rounded-lg border border-border bg-gradient-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="text-loss">📉</span> Top Losers
          </h3>
          <span className="text-[10px] text-loss font-mono">{losers.length} clients</span>
        </div>
        <div className="py-1 max-h-[280px] overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-6 rounded animate-shimmer" />)}</div>
          ) : losers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">No losing clients</div>
          ) : (
            losers.map(c => renderClient(c, 'loser'))
          )}
        </div>
      </div>
    </div>
  );
};

export default TopPnLClients;

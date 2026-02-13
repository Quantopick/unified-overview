import { formatNum } from '@/lib/api';
import type { PositionMatrixClient } from '@/lib/api';

interface PositionMatrixCompactProps {
  data: PositionMatrixClient[];
  symbols: string[];
  loading: boolean;
}

const PositionMatrixCompact = ({ data, symbols, loading }: PositionMatrixCompactProps) => {
  // Only show clients with positions and limit display
  const filtered = data
    .filter(c => symbols.some(s => c.positions?.[s]?.net_lot !== 0))
    .slice(0, 12);
  const displaySymbols = symbols.slice(0, 6);

  return (
    <div className="rounded-lg border border-border bg-gradient-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-primary">🔢</span> Position Matrix
        </h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {filtered.length} active clients
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        {loading ? (
          <div className="p-4 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-8 rounded animate-shimmer" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">No active positions</div>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="bg-card sticky top-0">
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Login</th>
                {displaySymbols.map(sym => (
                  <th key={sym} className="text-right px-2 py-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider whitespace-nowrap">{sym}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.login} className="border-b border-border/30 hover:bg-accent/40 transition-colors">
                  <td className="px-3 py-1.5">
                    <span className="font-mono text-muted-foreground">{client.login}</span>
                  </td>
                  {displaySymbols.map(sym => {
                    const pos = client.positions?.[sym];
                    const lot = pos?.net_lot ?? 0;
                    if (lot === 0) return <td key={sym} className="px-2 py-1.5 text-right text-muted-foreground/30 font-mono">—</td>;
                    return (
                      <td key={sym} className={`px-2 py-1.5 text-right font-mono font-medium ${lot > 0 ? 'text-profit' : 'text-loss'}`}>
                        {lot > 0 ? '+' : ''}{formatNum(lot)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PositionMatrixCompact;

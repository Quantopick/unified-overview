import { useState } from 'react';
import { formatNum } from '@/lib/api';
import type { PositionMatrixClient } from '@/lib/api';
import { Grid3X3 } from 'lucide-react';

interface PositionMatrixCompactProps {
  data: PositionMatrixClient[];
  symbols: string[];
  loading: boolean;
}

const PositionMatrixCompact = ({ data, symbols, loading }: PositionMatrixCompactProps) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const filtered = data
    .filter(c => symbols.some(s => c.positions?.[s]?.net_lot !== 0))
    .slice(0, 12);
  const displaySymbols = symbols.slice(0, 6);

  const maxLot = Math.max(
    ...filtered.flatMap(c => displaySymbols.map(s => Math.abs(c.positions?.[s]?.net_lot ?? 0))),
    1
  );

  return (
    <div className="card-interactive overflow-hidden animate-slide-up" style={{ animationDelay: '320ms' }}>
      <div className="section-header">
        <h3 className="section-title">
          <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
            <Grid3X3 className="h-3.5 w-3.5 text-primary" />
          </div>
          Position Matrix
        </h3>
        <span className="section-badge">{filtered.length} active clients</span>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-9 animate-shimmer" style={{ animationDelay: `${i * 80}ms` }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">No active positions</div>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="bg-card/95 backdrop-blur-sm sticky top-0 z-10">
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Login</th>
                {displaySymbols.map(sym => (
                  <th key={sym} className="text-center px-3 py-2.5 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider whitespace-nowrap">{sym}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((client, rowIdx) => (
                <tr key={client.login} className="border-b border-border/20 hover:bg-accent/20 transition-colors">
                  <td className="px-5 py-2">
                    <span className="font-mono text-muted-foreground font-medium">{client.login}</span>
                  </td>
                  {displaySymbols.map(sym => {
                    const pos = client.positions?.[sym];
                    const lot = pos?.net_lot ?? 0;
                    const cellKey = `${client.login}-${sym}`;
                    const isHovered = hoveredCell === cellKey;
                    const intensity = lot !== 0 ? Math.min(Math.abs(lot) / maxLot, 1) : 0;

                    if (lot === 0) {
                      return (
                        <td key={sym} className="px-3 py-2 text-center">
                          <span className="text-muted-foreground/20 font-mono">·</span>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={sym}
                        className="px-3 py-2 text-center"
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div
                          className={`inline-flex items-center justify-center min-w-[56px] px-2 py-1 rounded-md font-mono font-semibold transition-all duration-200 cursor-default ${
                            lot > 0
                              ? 'text-profit'
                              : 'text-loss'
                          } ${isHovered ? 'scale-110 shadow-sm' : ''}`}
                          style={{
                            background: lot > 0
                              ? `hsla(145, 70%, 45%, ${0.06 + intensity * 0.14})`
                              : `hsla(0, 72%, 55%, ${0.06 + intensity * 0.14})`,
                          }}
                        >
                          {lot > 0 ? '+' : ''}{formatNum(lot)}
                        </div>
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

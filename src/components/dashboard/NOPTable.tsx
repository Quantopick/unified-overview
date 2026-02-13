import { useState } from 'react';
import { formatNum } from '@/lib/api';
import type { NOPSymbol } from '@/lib/api';

interface NOPTableProps {
  data: NOPSymbol[];
  loading: boolean;
}

const NOPTable = ({ data, loading }: NOPTableProps) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Calculate max values for intensity bars
  const maxLot = Math.max(...data.map(d => Math.abs(d.net_lot)), 1);
  const maxPnl = Math.max(...data.map(d => Math.abs(d.net_pnl)), 1);

  return (
    <div className="card-interactive overflow-hidden h-full animate-slide-up">
      <div className="section-header">
        <h3 className="section-title">
          <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
            <span className="text-xs">📊</span>
          </div>
          NOP Summary
        </h3>
        <span className="section-badge">By Symbol</span>
      </div>

      <div className="max-h-[380px] overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-9 animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-xs">No data available</div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card/95 backdrop-blur-sm z-10">
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Symbol</th>
                <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Net Lot</th>
                <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">P&L</th>
                <th className="text-right px-5 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Pos</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 15).map((item, idx) => {
                const isHovered = hoveredRow === item.symbol;
                const lotBar = (Math.abs(item.net_lot) / maxLot) * 100;
                return (
                  <tr
                    key={item.symbol}
                    className={`border-b border-border/30 cursor-default transition-all duration-200 ${isHovered ? 'bg-accent/60' : 'hover:bg-accent/30'}`}
                    onMouseEnter={() => setHoveredRow(item.symbol)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-4 rounded-full transition-all duration-300 ${item.net_pnl >= 0 ? 'bg-profit' : 'bg-loss'} ${isHovered ? 'h-6' : ''}`} />
                        <span className="font-mono font-bold text-foreground text-[12px]">{item.symbol}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={`font-mono font-semibold ${item.net_lot >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {item.net_lot >= 0 ? '+' : ''}{formatNum(item.net_lot)}
                        </span>
                        <div className="w-full h-0.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full bar-animated ${item.net_lot >= 0 ? 'bg-profit/60' : 'bg-loss/60'}`}
                            style={{ width: `${lotBar}%`, animationDelay: `${idx * 80}ms` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-2.5 text-right font-mono font-semibold ${item.net_pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {item.net_pnl >= 0 ? '+' : ''}{formatNum(item.net_pnl)}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-5 rounded-full bg-secondary text-[10px] font-semibold text-muted-foreground">
                        {item.position_count}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default NOPTable;

import { formatNum } from '@/lib/api';
import type { NOPSymbol } from '@/lib/api';

interface NOPTableProps {
  data: NOPSymbol[];
  loading: boolean;
}

const NOPTable = ({ data, loading }: NOPTableProps) => {
  return (
    <div className="rounded-lg border border-border bg-gradient-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-primary">📊</span> NOP Summary
        </h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">By Symbol</span>
      </div>

      <div className="max-h-[340px] overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 rounded animate-shimmer" />
            ))}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Symbol</th>
                <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Net Lot</th>
                <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">P&L</th>
                <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Pos</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 15).map((item) => (
                <tr key={item.symbol} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-2">
                    <span className="font-mono font-semibold text-foreground">{item.symbol}</span>
                  </td>
                  <td className={`px-4 py-2 text-right font-mono font-medium ${item.net_lot >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {item.net_lot >= 0 ? '+' : ''}{formatNum(item.net_lot)}
                  </td>
                  <td className={`px-4 py-2 text-right font-mono font-medium ${item.net_pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {item.net_pnl >= 0 ? '+' : ''}{formatNum(item.net_pnl)}
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground font-mono">
                    {item.position_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default NOPTable;

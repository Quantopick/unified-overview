import { useState } from 'react';
import { formatCurrency } from '@/lib/api';
import type { ClientPnL } from '@/lib/api';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TopPnLClientsProps {
  data: ClientPnL[];
  loading: boolean;
}

const TopPnLClients = ({ data, loading }: TopPnLClientsProps) => {
  const [hoveredLogin, setHoveredLogin] = useState<number | null>(null);

  const winners = data.filter(c => c.pnl > 0).slice(0, 8);
  const losers = [...data].filter(c => c.pnl < 0).sort((a, b) => a.pnl - b.pnl).slice(0, 8);

  const maxAbsPnl = Math.max(
    ...winners.map(c => Math.abs(c.pnl)),
    ...losers.map(c => Math.abs(c.pnl)),
    1
  );

  const renderClient = (client: ClientPnL, type: 'winner' | 'loser', idx: number) => {
    const barWidth = Math.min((Math.abs(client.pnl) / maxAbsPnl) * 100, 100);
    const isHovered = hoveredLogin === client.login;
    return (
      <div
        key={client.login}
        onMouseEnter={() => setHoveredLogin(client.login)}
        onMouseLeave={() => setHoveredLogin(null)}
        className={`flex items-center gap-3 py-2 px-4 cursor-default transition-all duration-200 rounded-lg mx-2 ${
          isHovered ? 'bg-accent/60 scale-[1.01]' : 'hover:bg-accent/30'
        }`}
        style={{ animationDelay: `${idx * 60}ms` }}
      >
        {/* Rank */}
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
          idx === 0 ? (type === 'winner' ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss') : 'bg-secondary text-muted-foreground'
        }`}>
          {idx + 1}
        </div>

        <div className="w-14 shrink-0">
          <span className="font-mono text-[11px] text-muted-foreground">{client.login}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-foreground truncate font-medium">{client.name || '—'}</div>
          <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full bar-animated ${type === 'winner' ? 'bg-profit' : 'bg-loss'}`}
              style={{ width: `${barWidth}%`, animationDelay: `${idx * 80}ms` }}
            />
          </div>
        </div>
        <div className={`font-mono text-xs font-bold shrink-0 transition-transform duration-200 ${isHovered ? 'scale-110' : ''} ${type === 'winner' ? 'text-profit' : 'text-loss'}`}>
          {type === 'winner' ? '+' : ''}{formatCurrency(client.pnl, true)}
        </div>
      </div>
    );
  };

  const renderSection = (title: string, icon: React.ReactNode, clients: ClientPnL[], type: 'winner' | 'loser', colorClass: string, delay: string) => (
    <div className="card-interactive overflow-hidden animate-slide-up" style={{ animationDelay: delay }}>
      <div className="section-header">
        <h3 className="section-title">
          <div className={`w-6 h-6 rounded-md ${type === 'winner' ? 'bg-profit/15' : 'bg-loss/15'} flex items-center justify-center`}>
            {icon}
          </div>
          {title}
        </h3>
        <span className={`text-[10px] font-mono font-semibold ${colorClass}`}>{clients.length} clients</span>
      </div>
      <div className="py-1.5 max-h-[300px] overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-8 animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />)}</div>
        ) : clients.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-xs">
            No {type === 'winner' ? 'profitable' : 'losing'} clients
          </div>
        ) : (
          clients.map((c, idx) => renderClient(c, type, idx))
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {renderSection('Top Winners', <TrendingUp className="h-3.5 w-3.5 text-profit" />, winners, 'winner', 'text-profit', '200ms')}
      {renderSection('Top Losers', <TrendingDown className="h-3.5 w-3.5 text-loss" />, losers, 'loser', 'text-loss', '260ms')}
    </div>
  );
};

export default TopPnLClients;

import { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Activity, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/api';

interface KPICardsProps {
  totalPnL: number;
  totalDeposits: number;
  totalWithdrawals: number;
  netFlow: number;
  riskAlerts: number;
  totalPositions: number;
  loading: boolean;
}

const KPICards = ({ totalPnL, totalDeposits, totalWithdrawals, netFlow, riskAlerts, totalPositions, loading }: KPICardsProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cards = [
    { label: 'Net P&L', value: formatCurrency(totalPnL, true), icon: totalPnL >= 0 ? TrendingUp : TrendingDown, variant: totalPnL >= 0 ? 'profit' : 'loss' as const, desc: 'Total open position P&L' },
    { label: 'Total Deposits', value: formatCurrency(totalDeposits, true), icon: ArrowUpCircle, variant: 'profit' as const, desc: 'All client deposits' },
    { label: 'Total Withdrawals', value: formatCurrency(totalWithdrawals, true), icon: ArrowDownCircle, variant: 'loss' as const, desc: 'All client withdrawals' },
    { label: 'Net Flow', value: formatCurrency(netFlow, true), icon: Activity, variant: netFlow >= 0 ? 'profit' : 'loss' as const, desc: 'Deposits minus withdrawals' },
    { label: 'Risk Alerts', value: String(riskAlerts), icon: AlertTriangle, variant: riskAlerts > 5 ? 'loss' : riskAlerts > 0 ? 'warning' : 'neutral' as const, desc: 'Extreme + high risk clients' },
    { label: 'Open Positions', value: totalPositions.toLocaleString(), icon: Activity, variant: 'neutral' as const, desc: 'Active market positions' },
  ];

  const variantStyles = {
    profit: { border: 'border-profit/20 hover:border-profit/40', bg: 'bg-profit-subtle', glow: 'hover:shadow-glow-profit', icon: 'text-profit', iconBg: 'bg-profit/10' },
    loss: { border: 'border-loss/20 hover:border-loss/40', bg: 'bg-loss-subtle', glow: 'hover:shadow-glow-loss', icon: 'text-loss', iconBg: 'bg-loss/10' },
    warning: { border: 'border-warning/20 hover:border-warning/40', bg: '', glow: '', icon: 'text-warning', iconBg: 'bg-warning/10' },
    neutral: { border: 'border-border hover:border-primary/25', bg: '', glow: 'hover:shadow-glow', icon: 'text-muted-foreground', iconBg: 'bg-secondary' },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
      {cards.map((card, i) => {
        const styles = variantStyles[card.variant];
        const isHovered = hoveredIndex === i;
        return (
          <div
            key={card.label}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`group relative rounded-xl border p-4 bg-gradient-card shadow-card cursor-default
              transition-all duration-300 hover:-translate-y-1
              ${styles.border} ${styles.bg} ${styles.glow}`}
          >
            {loading ? (
              <div className="space-y-3">
                <div className="h-3 w-20 animate-shimmer" />
                <div className="h-7 w-16 animate-shimmer" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {card.label}
                  </span>
                  <div className={`w-7 h-7 rounded-lg ${styles.iconBg} flex items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
                    <card.icon className={`h-3.5 w-3.5 ${styles.icon}`} />
                  </div>
                </div>
                <div className={`text-xl font-bold font-mono ${styles.icon} transition-all duration-300 ${isHovered ? 'scale-105 origin-left' : ''}`}>
                  {card.value}
                </div>
                {/* Hover description */}
                <div className={`mt-1.5 flex items-center gap-1 transition-all duration-300 overflow-hidden ${isHovered ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <ChevronRight className="h-2.5 w-2.5 text-primary" />
                  <span className="text-[9px] text-muted-foreground">{card.desc}</span>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;

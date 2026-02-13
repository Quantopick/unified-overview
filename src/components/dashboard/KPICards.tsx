import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Activity } from 'lucide-react';
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
  const cards = [
    {
      label: 'Net P&L',
      value: formatCurrency(totalPnL, true),
      icon: totalPnL >= 0 ? TrendingUp : TrendingDown,
      variant: totalPnL >= 0 ? 'profit' : 'loss' as const,
    },
    {
      label: 'Total Deposits',
      value: formatCurrency(totalDeposits, true),
      icon: ArrowUpCircle,
      variant: 'profit' as const,
    },
    {
      label: 'Total Withdrawals',
      value: formatCurrency(totalWithdrawals, true),
      icon: ArrowDownCircle,
      variant: 'loss' as const,
    },
    {
      label: 'Net Flow',
      value: formatCurrency(netFlow, true),
      icon: Activity,
      variant: netFlow >= 0 ? 'profit' : 'loss' as const,
    },
    {
      label: 'Risk Alerts',
      value: String(riskAlerts),
      icon: AlertTriangle,
      variant: riskAlerts > 5 ? 'loss' : riskAlerts > 0 ? 'warning' : 'neutral' as const,
    },
    {
      label: 'Open Positions',
      value: totalPositions.toLocaleString(),
      icon: Activity,
      variant: 'neutral' as const,
    },
  ];

  const variantClasses = {
    profit: 'border-profit/20 bg-profit-subtle',
    loss: 'border-loss/20 bg-loss-subtle',
    warning: 'border-warning/20',
    neutral: 'border-border',
  };

  const iconClasses = {
    profit: 'text-profit',
    loss: 'text-loss',
    warning: 'text-warning',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg border p-4 bg-gradient-card shadow-card transition-all hover:shadow-glow ${variantClasses[card.variant]}`}
        >
          {loading ? (
            <div className="space-y-2">
              <div className="h-3 w-20 rounded animate-shimmer" />
              <div className="h-6 w-16 rounded animate-shimmer" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </span>
                <card.icon className={`h-3.5 w-3.5 ${iconClasses[card.variant]}`} />
              </div>
              <div className={`text-lg font-bold font-mono ${iconClasses[card.variant]}`}>
                {card.value}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default KPICards;

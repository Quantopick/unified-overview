import { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, ArrowDownRight, Banknote } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import KPICards from '@/components/dashboard/KPICards';
import NOPTable from '@/components/dashboard/NOPTable';
import TopPnLClients from '@/components/dashboard/TopPnLClients';
import RiskOverview from '@/components/dashboard/RiskOverview';
import PositionMatrixCompact from '@/components/dashboard/PositionMatrixCompact';
import {
  fetchNOPSummary,
  fetchDepositSummary,
  fetchClientMonitor,
  fetchRiskMonitor,
  fetchPositionMatrix,
  type NOPSymbol,
  type NOPTotals,
  type DepositSummary,
  type ClientPnL,
  type RiskSummary,
  type RiskClient,
  type PositionMatrixClient,
} from '@/lib/api';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  const [nopData, setNopData] = useState<NOPSymbol[]>([]);
  const [nopTotals, setNopTotals] = useState<NOPTotals>({ total_net_pnl: 0, total_positions: 0, symbol_count: 0 });
  const [deposits, setDeposits] = useState<DepositSummary>({ total_deposits: 0, total_withdrawals: 0, net_flow: 0, deposit_count: 0, withdrawal_count: 0 });
  const [clientPnL, setClientPnL] = useState<ClientPnL[]>([]);
  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  const [riskClients, setRiskClients] = useState<RiskClient[]>([]);
  const [matrixData, setMatrixData] = useState<PositionMatrixClient[]>([]);
  const [matrixSymbols, setMatrixSymbols] = useState<string[]>([]);

  const fetchAllData = useCallback(async () => {
    setApiStatus('checking');
    const results = await Promise.allSettled([
      fetchNOPSummary(),
      fetchDepositSummary(),
      fetchClientMonitor(40),
      fetchRiskMonitor(),
      fetchPositionMatrix(),
    ]);

    let anySuccess = false;
    if (results[0].status === 'fulfilled') { setNopData(results[0].value.data); setNopTotals(results[0].value.totals); anySuccess = true; }
    if (results[1].status === 'fulfilled') { setDeposits(results[1].value); anySuccess = true; }
    if (results[2].status === 'fulfilled') { setClientPnL(results[2].value); anySuccess = true; }
    if (results[3].status === 'fulfilled') { setRiskSummary(results[3].value.summary); setRiskClients(results[3].value.clients); anySuccess = true; }
    if (results[4].status === 'fulfilled') { setMatrixData(results[4].value.data); setMatrixSymbols(results[4].value.symbols); anySuccess = true; }

    setApiStatus(anySuccess ? 'connected' : 'disconnected');
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAllData]);

  const riskAlertCount = (riskSummary?.risk_distribution?.EXTREME ?? 0) + (riskSummary?.risk_distribution?.HIGH ?? 0);

  const fmtMoney = (v: number) => v?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00';

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-5">
        <DashboardHeader
          lastUpdate={lastUpdate}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => setAutoRefresh(p => !p)}
          onRefresh={fetchAllData}
          loading={loading}
          apiStatus={apiStatus}
        />

        <KPICards
          totalPnL={nopTotals.total_net_pnl}
          totalDeposits={deposits.total_deposits}
          totalWithdrawals={deposits.total_withdrawals}
          netFlow={deposits.net_flow}
          riskAlerts={riskAlertCount}
          totalPositions={nopTotals.total_positions}
          loading={loading}
        />

        {/* Main Grid: NOP + Risk + Deposits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <NOPTable data={nopData} loading={loading} />
          </div>
          <div className="lg:col-span-4">
            <RiskOverview summary={riskSummary} clients={riskClients} loading={loading} />
          </div>
          <div className="lg:col-span-4">
            <div className="card-interactive overflow-hidden h-full animate-slide-up" style={{ animationDelay: '160ms' }}>
              <div className="section-header">
                <h3 className="section-title">
                  <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
                    <Banknote className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Cash Flow
                </h3>
                <span className="section-badge">Summary</span>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />)}</div>
                ) : (
                  <div className="space-y-5">
                    {/* Deposits */}
                    <div className="group flex items-center gap-3 p-3 rounded-lg bg-profit/5 border border-profit/10 hover:border-profit/25 transition-all duration-200 cursor-default">
                      <div className="w-8 h-8 rounded-lg bg-profit/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <ArrowUpRight className="h-4 w-4 text-profit" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Deposits</div>
                        <div className="font-mono text-sm font-bold text-profit mt-0.5">+${fmtMoney(deposits.total_deposits)}</div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center justify-center min-w-[36px] h-6 rounded-full bg-profit/10 text-[10px] font-bold text-profit font-mono">
                          {deposits.deposit_count ?? 0}
                        </div>
                        <div className="text-[8px] text-muted-foreground mt-0.5">txns</div>
                      </div>
                    </div>

                    {/* Withdrawals */}
                    <div className="group flex items-center gap-3 p-3 rounded-lg bg-loss/5 border border-loss/10 hover:border-loss/25 transition-all duration-200 cursor-default">
                      <div className="w-8 h-8 rounded-lg bg-loss/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <ArrowDownRight className="h-4 w-4 text-loss" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Withdrawals</div>
                        <div className="font-mono text-sm font-bold text-loss mt-0.5">-${fmtMoney(deposits.total_withdrawals)}</div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center justify-center min-w-[36px] h-6 rounded-full bg-loss/10 text-[10px] font-bold text-loss font-mono">
                          {deposits.withdrawal_count ?? 0}
                        </div>
                        <div className="text-[8px] text-muted-foreground mt-0.5">txns</div>
                      </div>
                    </div>

                    {/* Net Flow */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Net Flow</span>
                        <span className={`font-mono text-xl font-black ${(deposits.net_flow ?? 0) >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {(deposits.net_flow ?? 0) >= 0 ? '+' : ''}${fmtMoney(deposits.net_flow)}
                        </span>
                      </div>
                      {/* Visual bar */}
                      <div className="mt-3 flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
                        {deposits.total_deposits > 0 && (
                          <div
                            className="h-full bg-profit rounded-l-full bar-animated"
                            style={{ width: `${(deposits.total_deposits / Math.max(deposits.total_deposits + deposits.total_withdrawals, 1)) * 100}%` }}
                          />
                        )}
                        {deposits.total_withdrawals > 0 && (
                          <div
                            className="h-full bg-loss rounded-r-full bar-animated"
                            style={{ width: `${(deposits.total_withdrawals / Math.max(deposits.total_deposits + deposits.total_withdrawals, 1)) * 100}%`, animationDelay: '200ms' }}
                          />
                        )}
                      </div>
                      <div className="mt-1.5 flex justify-between text-[9px] text-muted-foreground font-mono">
                        <span>Deposits</span>
                        <span>Withdrawals</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PnL Clients */}
        <TopPnLClients data={clientPnL} loading={loading} />

        {/* Position Matrix */}
        <PositionMatrixCompact data={matrixData} symbols={matrixSymbols} loading={loading} />
      </div>
    </div>
  );
};

export default Index;

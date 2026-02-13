import { useState, useEffect, useCallback } from 'react';
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

  // Data states
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

    if (results[0].status === 'fulfilled') {
      setNopData(results[0].value.data);
      setNopTotals(results[0].value.totals);
      anySuccess = true;
    }
    if (results[1].status === 'fulfilled') {
      setDeposits(results[1].value);
      anySuccess = true;
    }
    if (results[2].status === 'fulfilled') {
      setClientPnL(results[2].value);
      anySuccess = true;
    }
    if (results[3].status === 'fulfilled') {
      setRiskSummary(results[3].value.summary);
      setRiskClients(results[3].value.clients);
      anySuccess = true;
    }
    if (results[4].status === 'fulfilled') {
      setMatrixData(results[4].value.data);
      setMatrixSymbols(results[4].value.symbols);
      anySuccess = true;
    }

    setApiStatus(anySuccess ? 'connected' : 'disconnected');
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAllData]);

  const riskAlertCount = (riskSummary?.risk_distribution?.EXTREME ?? 0) + (riskSummary?.risk_distribution?.HIGH ?? 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <DashboardHeader
          lastUpdate={lastUpdate}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => setAutoRefresh(p => !p)}
          onRefresh={fetchAllData}
          loading={loading}
          apiStatus={apiStatus}
        />

        {/* KPI Cards */}
        <KPICards
          totalPnL={nopTotals.total_net_pnl}
          totalDeposits={deposits.total_deposits}
          totalWithdrawals={deposits.total_withdrawals}
          netFlow={deposits.net_flow}
          riskAlerts={riskAlertCount}
          totalPositions={nopTotals.total_positions}
          loading={loading}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: NOP Table */}
          <div className="lg:col-span-1">
            <NOPTable data={nopData} loading={loading} />
          </div>

          {/* Right: Risk Overview */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <RiskOverview summary={riskSummary} clients={riskClients} loading={loading} />
              {/* Deposit summary card */}
              <div className="rounded-lg border border-border bg-gradient-card shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span>💰</span> Deposits & Withdrawals
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {loading ? (
                    <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 rounded animate-shimmer" />)}</div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Deposits</span>
                          <span className="font-mono text-sm font-semibold text-profit">
                            +${deposits.total_deposits?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Withdrawals</span>
                          <span className="font-mono text-sm font-semibold text-loss">
                            -${deposits.total_withdrawals?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                          </span>
                        </div>
                        <div className="border-t border-border pt-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">Net Flow</span>
                          <span className={`font-mono text-base font-bold ${(deposits.net_flow ?? 0) >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {(deposits.net_flow ?? 0) >= 0 ? '+' : ''}${deposits.net_flow?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="rounded-md bg-muted/50 p-2.5 text-center">
                          <div className="text-lg font-bold font-mono text-foreground">{deposits.deposit_count ?? 0}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Deposit Txns</div>
                        </div>
                        <div className="rounded-md bg-muted/50 p-2.5 text-center">
                          <div className="text-lg font-bold font-mono text-foreground">{deposits.withdrawal_count ?? 0}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Withdrawal Txns</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
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

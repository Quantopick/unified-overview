import axios from 'axios';

export const API_URL = 'http://51.68.197.18:8000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Types
export interface NOPSymbol {
  symbol: string;
  net_lot: number;
  net_pnl: number;
  position_count: number;
}

export interface NOPTotals {
  total_net_pnl: number;
  total_positions: number;
  symbol_count: number;
}

export interface DepositSummary {
  total_deposits: number;
  total_withdrawals: number;
  net_flow: number;
  deposit_count: number;
  withdrawal_count: number;
}

export interface ClientPnL {
  login: number;
  name: string;
  group: string;
  pnl: number;
  pnl_percent: number;
  balance: number;
  equity: number;
}

export interface RiskSummary {
  total_clients: number;
  risk_distribution: {
    EXTREME: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    NORMAL: number;
  };
}

export interface RiskClient {
  login: number;
  name: string;
  group: string;
  risk_level: string;
  total_score: number;
  trade_count: number;
}

export interface PositionMatrixClient {
  login: number;
  name: string;
  group: string;
  positions: Record<string, { net_lot: number; pnl: number }>;
}

// API calls
export async function fetchNOPSummary(): Promise<{ data: NOPSymbol[]; totals: NOPTotals }> {
  const res = await api.get('/api/nop/summary');
  if (res.data.success) {
    return { data: res.data.data || [], totals: res.data.totals || {} };
  }
  throw new Error('Failed to fetch NOP summary');
}

export async function fetchDepositSummary(): Promise<DepositSummary> {
  const res = await api.get('/api/deposits/summary');
  if (res.data.success) return res.data.data || {};
  throw new Error('Failed to fetch deposit summary');
}

export async function fetchClientMonitor(limit = 20): Promise<ClientPnL[]> {
  const res = await api.get('/api/client-monitor', { params: { limit, sort_by: 'pnl', sort_order: 'desc' } });
  if (res.data.success) return res.data.data || [];
  throw new Error('Failed to fetch client monitor');
}

export async function fetchRiskMonitor(days = 7, minTrades = 10): Promise<{ clients: RiskClient[]; summary: RiskSummary }> {
  const res = await api.get('/api/risk-monitor/clients', { params: { days, min_trades: minTrades } });
  if (res.data.success) return { clients: res.data.clients || [], summary: res.data.summary || {} };
  throw new Error('Failed to fetch risk monitor');
}

export async function fetchPositionMatrix(): Promise<{ data: PositionMatrixClient[]; symbols: string[] }> {
  const res = await api.get('/api/position-matrix');
  if (res.data.success) return { data: res.data.data || [], symbols: res.data.symbols || [] };
  throw new Error('Failed to fetch position matrix');
}

// Formatters
export const formatCurrency = (v: number, short = false): string => {
  if (short) {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
  }
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNum = (v: number): string =>
  v?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-';

export interface Transaction {
  id: string;
  setuTxnId: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  mode: string;
  narration: string;
  sender: string | null;
  receiver: string | null;
  balance: number;
  timestamp: string;
  valueDate: string;
  tags: string[];
  isOutlier: boolean;
  accountId: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Account {
  id: string;
  maskedAccNumber: string;
  fipId: string;
  linkRefNumber: string;
  lastFetchedAt: string | null;
}

export interface ConsentResponse {
  id: string;
  url: string;
  status: string;
}

export interface SpendByTag {
  tag: string;
  total: number;
}

export interface MonthlySummary {
  month: string;
  spent: number;
  income: number;
}

export interface OverviewSummary {
  totalSpend: number;
  totalIncome: number;
  netBalance: number;
  topTag: string | null;
  untaggedCount: number;
}

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WithdrawRequest {
  amount: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface WithdrawResponse {
  success: boolean;
  message: string;
  withdrawalId?: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  processedAt?: string;
}

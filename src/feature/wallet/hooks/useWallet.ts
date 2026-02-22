import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { WALLET_ENDPOINTS } from "@/api/endpoints";
import type {
  WalletBalance,
  WalletTransactionsResponse,
  WithdrawRequest,
  WithdrawResponse,
  Withdrawal,
} from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

// ==================== QUERIES ====================

export const useWalletBalance = () => {
  return useQuery<WalletBalance>({
    queryKey: ["walletBalance"],
    queryFn: async () => {
      const { data } = await apiClient.get<WalletBalance>(
        WALLET_ENDPOINTS.BALANCE
      );
      return data;
    },
  });
};

export const useWalletTransactions = (page: number = 1, limit: number = 10) => {
  return useQuery<WalletTransactionsResponse>({
    queryKey: ["walletTransactions", page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<WalletTransactionsResponse>(
        WALLET_ENDPOINTS.TRANSACTIONS,
        { params: { page, limit } }
      );
      return data;
    },
  });
};

export const useWithdrawals = () => {
  return useQuery<Withdrawal[]>({
    queryKey: ["withdrawals"],
    queryFn: async () => {
      const { data } = await apiClient.get<Withdrawal[]>(
        WALLET_ENDPOINTS.WITHDRAWALS
      );
      return data;
    },
  });
};

// ==================== MUTATIONS ====================

export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation<WithdrawResponse, AxiosError<ApiError>, WithdrawRequest>({
    mutationFn: async (request) => {
      const { data } = await apiClient.post<WithdrawResponse>(
        WALLET_ENDPOINTS.WITHDRAW,
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      queryClient.invalidateQueries({ queryKey: ["walletTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
  });
};

import { useEffect } from "react";
import { useSocket } from "./use-socket";

import { useQueryClient } from "@tanstack/react-query";

interface UseTransactionsReturn {}

export function useTransactions(): UseTransactionsReturn {
  const { on } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleNewNotification = (data: { refresh?: boolean }) => {
      if (data.refresh) {
        queryClient.invalidateQueries({
          queryKey: ["transactions", "balance"],
        });
      }
    };

    on("new-transaction", handleNewNotification);
  }, [on, queryClient]);

  return {};
}

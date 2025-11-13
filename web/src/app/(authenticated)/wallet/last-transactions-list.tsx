"use client";
import { EmptyTransactions } from "@/components/empty-transactions";
import TransactionItem from "@/components/transaction-item";
import { CardContent } from "@/components/ui/card";
import { fetchTransactions } from "@/services/transactions";
import { getWallet } from "@/services/wallet";
import { useQuery } from "@tanstack/react-query";

export function LastTranscationsList() {
  const { data: walletData } = useQuery({
    queryKey: ["balance"],
    queryFn: () => getWallet(),
  });

  const { data } = useQuery({
    queryKey: ["transactions", 1, 5],
    queryFn: () =>
      fetchTransactions({
        pageSize: 5,
        pageIndex: 1,
      }),
  });

  return (
    <CardContent className="space-y-3">
      {data?.transactions?.length ? (
        data.transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            userWallet={walletData}
          />
        ))
      ) : (
        <EmptyTransactions />
      )}
    </CardContent>
  );
}

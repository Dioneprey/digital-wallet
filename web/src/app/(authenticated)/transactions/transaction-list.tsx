"use client";
import { fetchTransactions } from "@/services/transactions";
import TransactionItem, {
  TransactionItemSkeleton,
} from "@/components/transaction-item";
import {
  TransactionStatus,
  TransactionType,
} from "@/services/transactions/type";
import { EmptyTransactions } from "@/components/empty-transactions";
import { TransactionsPagination } from "./transactions-pagination";
import { useQuery } from "@tanstack/react-query";
import { getWallet } from "@/services/wallet";

export function TransactionsList({
  status,
  type,
  pageIndex,
}: {
  status?: TransactionStatus;
  type?: TransactionType;
  pageIndex?: string;
}) {
  const { data: walletData } = useQuery({
    queryKey: ["balance"],
    queryFn: () => getWallet(),
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "transactions",
      pageIndex && !isNaN(Number(pageIndex)) ? Number(pageIndex) : undefined,
      5,
      status,
      type,
    ],
    queryFn: () =>
      fetchTransactions({
        pageSize: 5,
        pageIndex:
          pageIndex && !isNaN(Number(pageIndex))
            ? Number(pageIndex)
            : undefined,
        status,
        type,
      }),
  });

  if (isLoading) {
    return Array.from({ length: 3 }).map((_, index) => (
      <TransactionItemSkeleton key={`transcation-item-skeleton-${index}`} />
    ));
  }

  return (
    <>
      {data?.transactions && data?.transactions?.length > 0 ? (
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
      <TransactionsPagination meta={data?.meta} />
    </>
  );
}

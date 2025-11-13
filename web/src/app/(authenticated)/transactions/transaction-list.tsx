import { fetchTransactions } from "@/services/transactions";
import TransactionItem from "@/components/transaction-item";
import {
  TransactionStatus,
  TransactionType,
} from "@/services/transactions/type";
import { EmptyTransactions } from "@/components/empty-transactions";
import { TransactionsPagination } from "./transactions-pagination";

export async function TransactionsList({
  status,
  type,
  pageIndex,
}: {
  status?: TransactionStatus;
  type?: TransactionType;
  pageIndex?: string;
}) {
  const { transactions, meta } = await fetchTransactions({
    status: status,
    type: type,
    pageSize: 5,
    pageIndex:
      pageIndex && !isNaN(Number(pageIndex)) ? Number(pageIndex) : undefined,
  });

  return (
    <>
      {transactions?.length > 0 ? (
        transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))
      ) : (
        <EmptyTransactions />
      )}
      <TransactionsPagination meta={meta} />
    </>
  );
}

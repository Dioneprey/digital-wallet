import { fetchTransactions } from "@/services/transactions";
import TransactionItem from "@/components/transaction-item";
import {
  TransactionStatus,
  TransactionType,
} from "@/services/transactions/type";
import { EmptyTransactions } from "@/components/empty-transactions";

export default async function TransactionsList({
  status,
  type,
}: {
  status?: TransactionStatus;
  type?: TransactionType;
}) {
  const { transactions } = await fetchTransactions({
    status: status,
    type: type,
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
    </>
  );
}

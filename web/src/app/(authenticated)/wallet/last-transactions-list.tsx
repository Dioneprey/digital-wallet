import { EmptyTransactions } from "@/components/empty-transactions";
import TransactionItem from "@/components/transaction-item";
import { CardContent } from "@/components/ui/card";
import { fetchTransactions } from "@/services/transactions";

export async function LastTranscationsList() {
  const { transactions } = await fetchTransactions({
    pageSize: 10,
  });

  return (
    <CardContent className="space-y-3">
      {transactions?.length ? (
        transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))
      ) : (
        <EmptyTransactions />
      )}
    </CardContent>
  );
}

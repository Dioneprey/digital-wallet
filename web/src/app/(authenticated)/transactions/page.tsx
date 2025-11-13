import { Header } from "@/components/header";
import TransactionsFilters from "./transactions-filters";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TransactionsList } from "./transaction-list";
import {
  TransactionStatus,
  TransactionType,
} from "@/services/transactions/type";
import { Suspense } from "react";
import { TransactionItemSkeleton } from "@/components/transaction-item";

export default async function Transactions({
  searchParams,
}: {
  searchParams: {
    status?: TransactionStatus;
    type?: TransactionType;
    pageIndex?: string;
  };
}) {
  const { status, type, pageIndex } = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <Header title={"Transações"} />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle>Suas transações</CardTitle>
                <CardDescription>
                  Acompanhe todas as movimentações da sua conta
                </CardDescription>
              </div>
              <TransactionsFilters />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Suspense
              fallback={Array.from({ length: 3 }).map((_, index) => (
                <TransactionItemSkeleton
                  key={`transcation-item-skeleton-${index}`}
                />
              ))}
            >
              <TransactionsList
                status={status}
                type={type}
                pageIndex={pageIndex}
              />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

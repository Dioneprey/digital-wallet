import TransactionItem from "@/components/transaction-item";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { mockTransactions } from "@/services/transactions";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { LastTranscationsList } from "./last-transactions-list";

export function LastTranscationsCard() {
  return (
    <Card className="shadow-medium">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Últimas transações</CardTitle>
          <CardDescription>Suas 5 movimentações mais recentes</CardDescription>
        </div>
        <Link href="/transactions">
          <Button variant="ghost" size="sm">
            Ver todas
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <LastTranscationsList />
    </Card>
  );
}

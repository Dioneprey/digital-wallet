import { Header } from "@/components/header";
import { BalanceCard } from "./balance-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { LastTranscationsList } from "./last-transactions-list";
import Link from "next/link";

export default async function Wallet() {
  return (
    <div className="min-h-screen bg-background">
      <Header title={"Carteira Digital"} home />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <BalanceCard />

        <Card className="shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimas transações</CardTitle>
              <CardDescription>
                Suas 5 movimentações mais recentes
              </CardDescription>
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
      </main>
    </div>
  );
}

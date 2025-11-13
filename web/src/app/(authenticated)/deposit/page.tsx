import { Header } from "@/components/header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { DepositCard } from "./deposit-card";

export default async function Deposit() {
  return (
    <div className="min-h-screen bg-background">
      <Header title={"Depositar"} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Novo depósito</CardTitle>
                <CardDescription>Adicione saldo à sua carteira</CardDescription>
              </div>
            </div>
          </CardHeader>

          <DepositCard />
        </Card>
      </main>
    </div>
  );
}

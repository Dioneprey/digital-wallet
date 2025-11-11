import { Header } from "@/components/header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowDownLeft } from "lucide-react";
import { DepositCard } from "./deposit-card";
import { DepositForm } from "./deposit-form";

export default async function Deposit() {
  return (
    <div className="min-h-screen bg-background">
      <Header title={"Depositar"} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowDownLeft className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Novo depósito</CardTitle>
                <CardDescription>Adicione saldo à sua carteira</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <DepositCard />
            <DepositForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

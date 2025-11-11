import { Header } from "@/components/header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowDownLeft } from "lucide-react";
import { WithdrawForm } from "./withdraw-form";

export default function Withdraw() {
  return (
    <div className="min-h-screen bg-background">
      <Header title={"Sacar"} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <ArrowDownLeft className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle>Novo saque</CardTitle>
                <CardDescription>
                  Retire dinheiro da sua carteira
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <WithdrawForm />
        </Card>
      </main>
    </div>
  );
}

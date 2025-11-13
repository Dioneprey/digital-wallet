import { Header } from "@/components/header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeftRight } from "lucide-react";
import { TransferCard } from "./transfer-card";

export default function Transfer() {
  return (
    <div className="min-h-screen bg-background">
      <Header title={"Sacar"} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ArrowLeftRight className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Nova transferência</CardTitle>
                <CardDescription>
                  Envie dinheiro para outra pessoa
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <TransferCard />
        </Card>
      </main>
    </div>
  );
}

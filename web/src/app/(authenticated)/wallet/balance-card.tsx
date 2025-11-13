import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { ActionLink } from "./action-link";
import { Plus, Minus, ArrowLeftRight } from "lucide-react";
import { ShowBalance } from "./show-balance";
import { Suspense } from "react";

export async function BalanceCard() {
  return (
    <Card className="primary-gradient text-primary-foreground shadow-strong">
      <CardHeader>
        <div className="flex flex-col items-start">
          <CardDescription className="text-primary-foreground/80">
            Saldo disponível
          </CardDescription>
          <Suspense
            fallback={
              <div className="animate-pulse h-10 w-32 bg-primary-foreground/20 rounded-xl" />
            }
          >
            <ShowBalance />
          </Suspense>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 pt-6">
        <ActionLink
          href="/deposit"
          title="Depositar"
          icon={<Plus />}
          color="bg-green-500"
          textColor="text-success"
        />
        <ActionLink
          href="/withdraw"
          title="Sacar"
          icon={<Minus />}
          color="bg-destructive"
          textColor="text-destructive-foreground"
        />
        <ActionLink
          href="/transfer"
          title="Transferir"
          icon={<ArrowLeftRight />}
          color="bg-blue-400"
          textColor="text-info-foreground"
        />
      </CardContent>
    </Card>
  );
}

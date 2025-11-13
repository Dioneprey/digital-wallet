import { formatCurrency } from "@/common/util/format-currency";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceProps {
  balance?: number;
}

export function Balance({ balance }: BalanceProps) {
  if (balance !== undefined) {
    return (
      <div className="p-4 rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground mb-1">Saldo atual</p>
        <p className="text-2xl font-bold text-foreground">
          {formatCurrency(balance)}
        </p>
      </div>
    );
  } else {
    return <Skeleton className="h-[87px] w-full rounded-xl" />;
  }
}

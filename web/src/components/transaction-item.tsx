import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/common/util/format-currency";
import { formatDate } from "@/common/util/format-date";
import { Transaction, TransactionType } from "@/services/transactions/type";
import { Skeleton } from "./ui/skeleton";

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "deposit":
        return {
          icon: ArrowDownLeft,
          label: "Depósito",
          bgColor: "bg-green-100",
          iconColor: "text-green-600",
        };
      case "withdraw":
        return {
          icon: ArrowUpRight,
          label: "Saque",
          bgColor: "bg-destructive/10",
          iconColor: "text-destructive",
        };
      case "transfer":
        return {
          icon: ArrowLeftRight,
          label: "Transferência",
          bgColor: "bg-blue-100",
          iconColor: "text-blue-600",
        };
      default:
        return {
          icon: ArrowLeftRight,
          label: "Transação",
          bgColor: "bg-muted",
          iconColor: "text-muted-foreground",
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Concluída", variant: "default" as const };
      case "pending":
        return { label: "Pendente", variant: "secondary" as const };
      case "failed":
        return { label: "Falha", variant: "destructive" as const };
      default:
        return { label: status, variant: "default" as const };
    }
  };

  const typeConfig = getTypeConfig(transaction.type);
  const statusConfig = getStatusConfig(transaction.status);
  const Icon = typeConfig.icon;
  const isPositive = transaction.type === TransactionType.DEPOSIT;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-4">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            typeConfig.bgColor
          )}
        >
          <Icon className={cn("h-6 w-6", typeConfig.iconColor)} />
        </div>
        <div>
          <p className="font-medium text-foreground">
            {transaction.description}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-sm text-muted-foreground">{typeConfig.label}</p>
            <span className="text-muted-foreground">•</span>
            <p className="text-sm text-muted-foreground">
              {formatDate(new Date(transaction.createdAt))}
            </p>
          </div>
        </div>
      </div>
      <div className="text-right space-y-1">
        <p
          className={cn(
            "font-semibold text-lg",
            isPositive ? "text-success" : "text-red-600"
          )}
        >
          {isPositive ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </p>
        <Badge variant={statusConfig.variant} className="text-xs">
          {statusConfig.label}
        </Badge>
      </div>
    </div>
  );
};

export function TransactionItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-12 h-12 rounded-full" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>

      <div className="text-right space-y-2">
        <Skeleton className="h-5 w-16 ml-auto" />
        <Skeleton className="h-5 w-12 ml-auto rounded-full" />
      </div>
    </div>
  );
}

export default TransactionItem;

import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/common/util/format-currency";
import { formatDate } from "@/common/util/format-date";
import {
  ReversalInitiator,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/services/transactions/type";
import { Skeleton } from "./ui/skeleton";
import { ReverseTransfer } from "./reverse-transfer";
import { Wallet } from "@/services/wallet/type";

interface TransactionItemProps {
  transaction: Transaction;
  userWallet?: Wallet | null;
}

const TransactionItem = ({ transaction, userWallet }: TransactionItemProps) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return {
          icon: ArrowDownLeft,
          label: "Depósito",
          bgColor: "bg-green-100",
          iconColor: "text-green-600",
        };
      case TransactionType.WITHDRAW:
        return {
          icon: ArrowUpRight,
          label: "Saque",
          bgColor: "bg-destructive/10",
          iconColor: "text-destructive",
        };
      case TransactionType.TRANSFER:
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

  const getStatusConfig = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return { label: "Concluída", variant: "default" as const };
      case TransactionStatus.PENDING:
        return { label: "Pendente", variant: "secondary" as const };
      case TransactionStatus.FAILED:
        return { label: "Falha", variant: "destructive" as const };
      case TransactionStatus.REVERSED:
        return { label: "Rervertida", variant: "warning" as const };
      default:
        return { label: status, variant: "default" as const };
    }
  };

  const typeConfig = getTypeConfig(transaction.type);
  const statusConfig = getStatusConfig(transaction.status);
  const Icon = typeConfig.icon;
  const userCreatedTransaction = transaction.toWalletId === userWallet?.id;
  const isPositive =
    transaction.type === TransactionType.DEPOSIT ||
    (transaction.type === TransactionType.TRANSFER && userCreatedTransaction);

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
          {transaction.reversalReason && (
            <>
              <p className="text-sm text-muted-foreground">
                Revertida: {transaction.reversalReason}
              </p>
              <p className="text-sm text-muted-foreground">
                Por:
                {transaction.reversalInitiator === ReversalInitiator.SYSTEM
                  ? "Sistema"
                  : "Usuário"}
              </p>
            </>
          )}
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-sm text-muted-foreground">{typeConfig.label}</p>
            <span className="text-muted-foreground">•</span>
            <p className="text-sm text-muted-foreground">
              {formatDate(new Date(transaction.createdAt))}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {userCreatedTransaction &&
          transaction.type === TransactionType.TRANSFER &&
          transaction.status === TransactionStatus.COMPLETED && (
            <ReverseTransfer transaction={transaction} />
          )}
        <div className="text-right space-y-1">
          <p
            className={cn(
              "font-semibold text-lg",
              transaction.status === TransactionStatus.REVERSED
                ? "text-muted-foreground line-through"
                : isPositive
                ? "text-success"
                : "text-red-600"
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

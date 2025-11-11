import { ReceiptText } from "lucide-react";

export function EmptyTransactions() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <div className="bg-muted rounded-full p-4 mb-4">
        <ReceiptText className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium">Nenhuma transação encontrada</p>
      <p className="text-sm text-muted-foreground">
        Suas movimentações aparecerão aqui assim que realizar alguma operação.
      </p>
    </div>
  );
}

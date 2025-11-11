import { getWallet } from "@/services/wallet";
import { formatCurrency } from "@/common/util/format-currency";

export async function DepositCard() {
  const walletBalance = await getWallet();

  return (
    <div className="p-4 rounded-lg bg-muted">
      <p className="text-sm text-muted-foreground mb-1">Saldo atual</p>
      <p className="text-2xl font-bold text-foreground">
        {formatCurrency(walletBalance.balance)}
      </p>
    </div>
  );
}

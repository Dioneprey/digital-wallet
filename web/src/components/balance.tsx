import { getWallet } from "@/services/wallet";
import { ToggleBalance } from "./toggle-balance";

export async function Balance({
  color = "WHITE",
  size = "LARGE",
}: {
  size?: "SMALL" | "LARGE";
  color?: "BLACK" | "WHITE";
}) {
  const walletBalance = await getWallet();

  return (
    <ToggleBalance balance={walletBalance?.balance} color={color} size={size} />
  );
}

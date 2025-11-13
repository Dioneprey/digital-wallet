import { getWallet } from "@/services/wallet";
import { ToggleBalance } from "../../../components/toggle-balance";

export async function ShowBalance({
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

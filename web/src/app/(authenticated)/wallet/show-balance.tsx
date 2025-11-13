"use client";
import { getWallet } from "@/services/wallet";
import { ToggleBalance } from "../../../components/toggle-balance";
import { useQuery } from "@tanstack/react-query";

export function ShowBalance({
  color = "WHITE",
  size = "LARGE",
}: {
  size?: "SMALL" | "LARGE";
  color?: "BLACK" | "WHITE";
}) {
  const { data } = useQuery({
    queryKey: ["balance"],
    queryFn: () => getWallet(),
  });

  if (data?.balance) {
    return <ToggleBalance balance={data?.balance} color={color} size={size} />;
  } else {
    return (
      <div className="animate-pulse h-10 w-32 bg-primary-foreground/20 rounded-xl" />
    );
  }
}

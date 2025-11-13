"use client";
import { CardContent } from "@/components/ui/card";
import { WithdrawForm } from "./withdraw-form";
import { useQuery } from "@tanstack/react-query";
import { getWallet } from "@/services/wallet";
import { Balance } from "@/components/balance";

export function WithdrawCard() {
  const { data } = useQuery({
    queryKey: ["balance"],
    queryFn: () => getWallet(),
  });

  return (
    <CardContent className="space-y-6">
      <Balance balance={data?.balance} />
      <WithdrawForm balance={data?.balance} />
    </CardContent>
  );
}

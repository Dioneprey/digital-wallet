"use client";
import { CardContent } from "@/components/ui/card";
import { TransferForm } from "./transfer-form";
import { useQuery } from "@tanstack/react-query";
import { getWallet } from "@/services/wallet";
import { Balance } from "@/components/balance";

export function TransferCard() {
  const { data } = useQuery({
    queryKey: ["balance"],
    queryFn: () => getWallet(),
  });

  return (
    <CardContent className="space-y-6">
      <Balance balance={data?.balance} />
      <TransferForm balance={data?.balance} />
    </CardContent>
  );
}

import { Header } from "@/components/header";
import { BalanceCard } from "./balance-card";
import { LastTranscationsCard } from "./last-transactions-card";

export default async function Wallet() {
  return (
    <div className="min-h-screen bg-background">
      <Header title={"Carteira Digital"} home />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <BalanceCard />

        <LastTranscationsCard />
      </main>
    </div>
  );
}

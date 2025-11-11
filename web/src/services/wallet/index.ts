import { get } from "@/common/util/fetch";
import { Wallet } from "./type";

export async function getWallet() {
  const response = await get<{ wallet: Wallet }>({
    path: "wallet",
    tags: ["wallet"],
  });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  if (!response) {
    throw new Error("Resposta vazia da API");
  }

  return response.wallet;
}

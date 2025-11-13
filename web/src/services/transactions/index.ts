import { PaginationMetaResponse } from "@/common/interfaces/pagination-meta-response";
import { Transaction, TransactionStatus, TransactionType } from "./type";
import { get } from "@/common/util/fetch";

interface FetchTransactionsProps {
  type?: TransactionType;
  status?: TransactionStatus;
  pageIndex?: number;
  pageSize?: number;
}

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: TransactionType.DEPOSIT,
    amount: 10000,
    description: "Depósito inicial",
    createdAt: new Date("2025-01-15T10:00:00"),
    status: TransactionStatus.COMPLETED,
  },
  {
    id: "2",
    type: TransactionType.TRANSFER,
    amount: -2500,
    description: "Transferência para João",
    createdAt: new Date("2025-01-14T15:30:00"),
    status: TransactionStatus.COMPLETED,
  },
  {
    id: "3",
    type: TransactionType.WITHDRAW,
    amount: -1500,
    description: "Saque ATM",
    createdAt: new Date("2025-01-13T09:15:00"),
    status: TransactionStatus.COMPLETED,
  },
  {
    id: "4",
    type: TransactionType.DEPOSIT,
    amount: 5000,
    description: "Recebido de Maria",
    createdAt: new Date("2025-01-12T14:20:00"),
    status: TransactionStatus.COMPLETED,
  },
  {
    id: "5",
    type: TransactionType.TRANSFER,
    amount: -800,
    description: "Compra online",
    createdAt: new Date("2025-01-11T18:45:00"),
    status: TransactionStatus.COMPLETED,
  },
];

export async function fetchTransactions({
  status,
  type,
  pageIndex = 1,
  pageSize = 10,
}: FetchTransactionsProps) {
  const tags = ["transactions", String(pageIndex), String(pageSize)];

  if (status) {
    tags.push(status?.toUpperCase());
  }
  if (type) {
    tags.push(type?.toUpperCase());
  }
  if (status) {
    tags.push(status?.toUpperCase());
  }

  const response = await get<{
    transactions: Transaction[];
    meta: PaginationMetaResponse;
  }>({
    path: "transactions",
    tags: tags,
    params: {
      status: status?.toUpperCase(),
      type: type?.toUpperCase(),
      pageIndex,
      pageSize,
    },
  });

  if (!response) {
    throw new Error("Resposta vazia da API");
  }

  return response;
}

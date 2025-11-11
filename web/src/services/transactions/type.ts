import { Wallet } from "../wallet/type";

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  TRANSFER = "TRANSFER",
  WITHDRAW = "WITHDRAW",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  REVERSED = "REVERSED",
  FAILED = "FAILED",
}

export enum ReversalInitiator {
  USER = "USER",
  SYSTEM = "SYSTEM",
}

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number; // em centavos
  description?: string | null;
  reversed?: boolean | null;
  status: TransactionStatus;
  reversalReason?: string | null;
  reversalInitiator?: ReversalInitiator | null;
  fromWalletId?: string | null;
  toWalletId?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  fromWallet?: Wallet | null;
  toWallet?: Wallet | null;
};

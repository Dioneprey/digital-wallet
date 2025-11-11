export interface Wallet {
  id: string;
  balance: number;
  userId: string;
  createdAt: Date;
  updatedAt?: Date | null;
}

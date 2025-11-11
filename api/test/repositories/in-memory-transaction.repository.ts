import {
  TransactionRepository,
  TransactionRepositoryFindByUniqueFieldProps,
} from 'src/domain/wallet/application/repositories/transaction.repository';
import { Transaction } from 'src/domain/wallet/entities/transaction';

export class InMemoryTransactionRepository implements TransactionRepository {
  public items: Transaction[] = [];

  async findByUniqueField({
    key,
    value,
  }: TransactionRepositoryFindByUniqueFieldProps): Promise<Transaction | null> {
    const transaction = this.items.find((item) => {
      const fieldValue = (item as any)[key];
      return String(fieldValue) === String(value);
    });

    if (!transaction) {
      return null;
    }

    return transaction;
  }

  async create(transaction: Transaction): Promise<Transaction> {
    this.items.push(transaction);
    return transaction;
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const index = this.items.findIndex((item) => item.id === transaction.id);

    if (index >= 0) {
      this.items[index] = transaction;
    } else {
      this.items.push(transaction);
    }

    return transaction;
  }

  async delete(transaction: Transaction): Promise<void> {
    const index = this.items.findIndex((item) => item.id === transaction.id);

    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }

  async applyTransferBetweenWallets(data: {
    transaction: Transaction;
    fromWallet: any;
    toWallet: any;
  }): Promise<{
    transaction: Transaction;
    fromWallet: any;
    toWallet: any;
  }> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === data.transaction.id.toString(),
    );

    if (index >= 0) {
      this.items[index] = data.transaction;
    } else {
      this.items.push(data.transaction);
    }

    return {
      transaction: data.transaction,
      fromWallet: data.fromWallet,
      toWallet: data.toWallet,
    };
  }

  async applyTransactionToWallet(data: {
    wallet: any;
    transaction: Transaction;
  }): Promise<{
    wallet: any;
    transaction: Transaction;
  }> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === data.transaction.id.toString(),
    );

    if (index >= 0) {
      this.items[index] = data.transaction;
    } else {
      this.items.push(data.transaction);
    }

    return {
      wallet: data.wallet,
      transaction: data.transaction,
    };
  }
}

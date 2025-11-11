import { Transaction } from 'src/domain/wallet/entities/transaction';
import { WalletPresenter } from './wallet-presenter';

export class TransactionPresenter {
  static toHTTP(transaction: Transaction | null) {
    if (transaction === null) {
      return {};
    }

    return {
      id: transaction.id.toString(),
      fromWalletId: transaction?.fromWalletId?.toString(),
      fromWallet: transaction.fromWallet
        ? WalletPresenter.toHTTP(transaction.fromWallet)
        : null,
      toWalletId: transaction?.toWalletId?.toString(),
      toWallet: transaction.toWallet
        ? WalletPresenter.toHTTP(transaction.toWallet)
        : null,
      amount: transaction.amount ?? null,
      type: transaction.type ?? null,
      description: transaction.description ?? null,
      reversalInitiator: transaction.reversalInitiator ?? null,
      reversalReason: transaction.reversalReason ?? null,
      reversed: transaction.reversed ?? null,
      status: transaction.status ?? null,
      createdAt: transaction.createdAt ?? null,
      updatedAt: transaction.updatedAt ?? null,
    };
  }
}

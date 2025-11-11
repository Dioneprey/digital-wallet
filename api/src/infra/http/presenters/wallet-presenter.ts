import { Wallet } from 'src/domain/wallet/entities/wallet';

export class WalletPresenter {
  static toHTTP(wallet: Wallet | null) {
    if (wallet === null) {
      return {};
    }

    return {
      id: wallet.id.toString(),
      userId: wallet.userId.toString(),
      balance: wallet.balance ?? null,
      createdAt: wallet.createdAt ?? null,
      updatedAt: wallet.updatedAt ?? null,
    };
  }
}

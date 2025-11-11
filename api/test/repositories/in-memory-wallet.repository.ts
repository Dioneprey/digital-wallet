import {
  WalletRepository,
  WalletRepositoryFindByUniqueFieldProps,
} from 'src/domain/wallet/application/repositories/wallet.repository';
import { Wallet } from 'src/domain/wallet/entities/wallet';

export class InMemoryWalletRepository implements WalletRepository {
  public items: Wallet[] = [];

  async findByUniqueField({
    key,
    value,
  }: WalletRepositoryFindByUniqueFieldProps): Promise<Wallet | null> {
    const wallet = this.items.find((item) => {
      const fieldValue = (item as any)[key];
      return String(fieldValue) === String(value);
    });

    if (!wallet) {
      return null;
    }

    return wallet;
  }

  async save(wallet: Wallet): Promise<Wallet> {
    const index = this.items.findIndex((item) => item.id === wallet.id);

    this.items[index] = wallet;

    return wallet;
  }

  async delete(wallet: Wallet): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === wallet.id);

    this.items.splice(itemIndex, 1);
  }

  async create(wallet: Wallet) {
    this.items.push(wallet);

    return wallet;
  }
}

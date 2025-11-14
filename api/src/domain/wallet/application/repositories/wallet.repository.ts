import { Wallet, WalletInclude, WalletKey } from '../../entities/wallet';

export interface WalletRepositoryFindByUniqueFieldProps {
  key: WalletKey;
  value: string;
  include?: WalletInclude;
}

export abstract class WalletRepository {
  abstract findByUniqueField({
    key,
    value,
  }: WalletRepositoryFindByUniqueFieldProps): Promise<Wallet | null>;

  abstract create(wallet: Wallet): Promise<Wallet>;
  abstract save(wallet: Wallet): Promise<Wallet>;
  abstract delete(wallet: Wallet): Promise<void>;
}

import { Prisma, Wallet as PrismaWallet } from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Wallet } from 'src/domain/wallet/entities/wallet';

export type WalletWithInclude = PrismaWallet & {};

export class PrismaWalletMapper {
  static toDomain(raw: WalletWithInclude): Wallet {
    return Wallet.create(
      {
        ...raw,
        userId: new UniqueEntityID(raw.userId),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(wallet: Wallet): Prisma.WalletUncheckedCreateInput {
    return {
      id: wallet.id.toString(),
      userId: wallet.userId.toString(),
      balance: wallet.balance,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }
}

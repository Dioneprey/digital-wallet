import {
  Prisma,
  User as PrismaUser,
  Wallet as PrismaWallet,
} from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { User } from 'src/domain/wallet/entities/user';
import { PrismaWalletMapper } from './prisma-wallet.mapper';

export type UserWithInclude = PrismaUser & {
  wallet?: PrismaWallet | null;
};

export class PrismaUserMapper {
  static toDomain(raw: UserWithInclude): User {
    return User.create(
      {
        ...raw,
        wallet: raw.wallet
          ? PrismaWalletMapper.toDomain(raw.wallet)
          : undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

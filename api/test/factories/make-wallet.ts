import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Wallet, WalletProps } from 'src/domain/wallet/entities/wallet';
import { PrismaWalletMapper } from 'src/infra/database/prisma/mappers/prisma-wallet.mapper';
// import { PrismaWalletMapper } from 'src/infra/database/prisma/mappers/prisma-wallet-mapper';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

export function makeWallet(
  override: Partial<WalletProps> = {},
  id?: UniqueEntityID,
) {
  const wallet = Wallet.create(
    {
      balance: 0,
      userId: override.userId || new UniqueEntityID(),
      ...override,
    },
    id,
  );

  return wallet;
}

@Injectable()
export class WalletFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaWallet(data: Partial<WalletProps> = {}): Promise<Wallet> {
    const wallet = makeWallet(data);

    await this.prisma.wallet.create({
      data: PrismaWalletMapper.toPrisma(wallet),
    });

    return wallet;
  }
}

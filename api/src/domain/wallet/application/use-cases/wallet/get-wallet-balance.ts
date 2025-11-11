import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { Wallet } from 'src/domain/wallet/entities/wallet';
import { WalletRepository } from '../../repositories/wallet.repository';

interface GetWalletBalanceUseCaseRequest {
  userId: string;
}

type GetWalletBalanceUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    wallet: Wallet;
  }
>;

@Injectable()
export class GetWalletBalanceUseCase {
  constructor(private walletRepository: WalletRepository) {}

  async execute({
    userId,
  }: GetWalletBalanceUseCaseRequest): Promise<GetWalletBalanceUseCaseResponse> {
    let walletExists = await this.walletRepository.findByUniqueField({
      key: 'userId',
      value: userId,
    });

    if (!walletExists) {
      return left(new ResourceNotFoundError(`Wallet from user: ${userId}`));
    }

    return right({ wallet: walletExists });
  }
}

import { expect } from 'vitest';
import { InMemoryWalletRepository } from 'test/repositories/in-memory-wallet.repository';
import { InMemoryTransactionRepository } from 'test/repositories/in-memory-transaction.repository';
import { makeWallet } from 'test/factories/make-wallet';
import { makeTransaction } from 'test/factories/make-transaction';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';
import { InsufficienteBalanceError } from '../../@errors/insufficiente-balance.error';
import { ResourceInvalidError } from '../../@errors/resource-invalid.error';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { ProcessReverseTransferTransactionUseCase } from './process-reverse-transfer-transaction';

let inMemoryWalletRepository: InMemoryWalletRepository;
let inMemoryTransactionRepository: InMemoryTransactionRepository;
let sut: ProcessReverseTransferTransactionUseCase;

describe('Process reverse transfer transaction', () => {
  beforeEach(() => {
    inMemoryWalletRepository = new InMemoryWalletRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();
    sut = new ProcessReverseTransferTransactionUseCase(
      inMemoryWalletRepository,
      inMemoryTransactionRepository,
    );
  });

  it('should process a reverse transfer transaction successfully', async () => {
    const fromWallet = makeWallet(
      { balance: 10000 },
      new UniqueEntityID('from-wallet'),
    );
    const toWallet = makeWallet(
      { balance: 5000 },
      new UniqueEntityID('to-wallet'),
    );

    const transaction = makeTransaction({
      type: TransactionType.TRANSFER,
      amount: 5000,
      status: TransactionStatus.PENDING,
      fromWalletId: fromWallet.id,
      toWalletId: toWallet.id,
    });

    inMemoryWalletRepository.items.push(fromWallet, toWallet);
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      fromWalletId: fromWallet.id.toString(),
      toWalletId: toWallet.id.toString(),
    });

    expect(result.isLeft()).toBeFalsy();

    expect(transaction.status).toBe(TransactionStatus.REVERSED);
  });
});

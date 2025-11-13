import { describe, it, beforeEach, expect } from 'vitest';
import { InMemoryTransactionRepository } from 'test/repositories/in-memory-transaction.repository';
import { InMemoryWalletRepository } from 'test/repositories/in-memory-wallet.repository';
import { makeWallet } from 'test/factories/make-wallet';
import { makeTransaction } from 'test/factories/make-transaction';
import {
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { UpdateTransactionOnErrorUseCase } from './handle-transaction-error';

let inMemoryTransactionRepository: InMemoryTransactionRepository;
let inMemoryWalletRepository: InMemoryWalletRepository;
let sut: UpdateTransactionOnErrorUseCase;

describe('Update Transaction On Error', () => {
  beforeEach(() => {
    inMemoryTransactionRepository = new InMemoryTransactionRepository();
    inMemoryWalletRepository = new InMemoryWalletRepository();
    sut = new UpdateTransactionOnErrorUseCase(
      inMemoryTransactionRepository,
      inMemoryWalletRepository,
    );
  });

  it('should update transaction status without affecting wallet if fromWalletId not provided', async () => {
    const transaction = makeTransaction({
      amount: 5000,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
    });
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      status: TransactionStatus.FAILED,
      shouldChangeAmount: false,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updated = inMemoryTransactionRepository.items[0];
      expect(updated.status).toBe(TransactionStatus.FAILED);
    }
  });

  it('should update transaction status and revert wallet balance if not a deposit', async () => {
    const wallet = makeWallet({ balance: 10000 });
    inMemoryWalletRepository.items.push(wallet);

    const transaction = makeTransaction({
      amount: 5000,
      type: TransactionType.TRANSFER,
      status: TransactionStatus.PENDING,
      fromWalletId: wallet.id,
    });
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      status: TransactionStatus.FAILED,
      fromWalletId: wallet.id.toString(),
      shouldChangeAmount: true,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updated = inMemoryTransactionRepository.items[0];
      const updatedWallet = inMemoryWalletRepository.items[0];
      expect(updated.status).toBe(TransactionStatus.FAILED);
      expect(updatedWallet.balance).toBe(15000); // saldo revertido
    }
  });

  it('should return ResourceNotFoundError if transaction does not exist', async () => {
    const result = await sut.execute({
      transactionId: 'non-existent',
      status: TransactionStatus.FAILED,
      shouldChangeAmount: false,
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});

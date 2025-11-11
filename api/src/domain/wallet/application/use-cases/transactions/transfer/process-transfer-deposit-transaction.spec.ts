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
import { ProcessTransferTransactionUseCase } from './process-transfer-deposit-transaction';

let inMemoryWalletRepository: InMemoryWalletRepository;
let inMemoryTransactionRepository: InMemoryTransactionRepository;
let sut: ProcessTransferTransactionUseCase;

describe('Process transfer transaction', () => {
  beforeEach(() => {
    inMemoryWalletRepository = new InMemoryWalletRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();
    sut = new ProcessTransferTransactionUseCase(
      inMemoryWalletRepository,
      inMemoryTransactionRepository,
    );
  });

  it('should process a transfer transaction successfully', async () => {
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
      amount: 3000,
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

    expect(fromWallet.balance).toBe(7000);
    expect(toWallet.balance).toBe(8000);
    expect(transaction.status).toBe(TransactionStatus.COMPLETED);
  });

  it('should return error if transaction does not exist', async () => {
    const result = await sut.execute({
      transactionId: 'non-existing',
      fromWalletId: 'any-wallet',
      toWalletId: 'any-wallet',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return error if some wallet does not exist', async () => {
    const toWallet = makeWallet({ balance: 0 });
    inMemoryWalletRepository.items.push(toWallet);

    const transaction = makeTransaction({
      type: TransactionType.TRANSFER,
      amount: 1000,
      status: TransactionStatus.PENDING,
      fromWalletId: new UniqueEntityID('from-wallet'),
      toWalletId: toWallet.id,
    });
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      fromWalletId: 'non-existing-wallet',
      toWalletId: toWallet.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return error if transaction is not pending', async () => {
    const fromWallet = makeWallet({ balance: 5000 });
    const toWallet = makeWallet({ balance: 2000 });

    const transaction = makeTransaction({
      type: TransactionType.TRANSFER,
      amount: 1000,
      status: TransactionStatus.COMPLETED,
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

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceInvalidError);
  });

  it('should return error if fromWallet has insufficient balance', async () => {
    const fromWallet = makeWallet({ balance: 500 });
    const toWallet = makeWallet({ balance: 1000 });

    const transaction = makeTransaction({
      type: TransactionType.TRANSFER,
      amount: 1000,
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

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(InsufficienteBalanceError);
  });
});

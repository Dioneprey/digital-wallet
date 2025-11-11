import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';
import { Wallet } from './wallet';

export type TransactionKey = 'id';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  TRANSFER = 'TRANSFER',
  WITHDRAW = 'WITHDRAW',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REVERSED = 'REVERSED',
  FAILED = 'FAILED',
}

export enum ReversalInitiator {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
}

export interface TransactionProps {
  type: TransactionType;
  amount: number; // valor em centavos
  description?: string | null;
  reversed: boolean;
  status: TransactionStatus;
  reversalReason?: string | null;
  reversalInitiator?: ReversalInitiator | null;
  fromWalletId?: UniqueEntityID | null;
  fromWallet?: Wallet | null;
  toWalletId?: UniqueEntityID | null;
  toWallet?: Wallet | null;

  createdAt: Date;
  updatedAt?: Date | null;
}

export class Transaction extends Entity<TransactionProps> {
  get type() {
    return this.props.type;
  }

  get amount() {
    return this.props.amount;
  }
  set amount(value: number) {
    this.props.amount = value;
    this.touch();
  }

  get description() {
    return this.props.description;
  }
  set description(desc: string | undefined | null) {
    this.props.description = desc;
    this.touch();
  }

  get reversed() {
    return this.props.reversed;
  }
  set reversed(value: boolean) {
    this.props.reversed = value;
    this.touch();
  }

  get status() {
    return this.props.status;
  }
  set status(value: TransactionStatus) {
    this.props.status = value;
    this.touch();
  }

  get reversalReason() {
    return this.props.reversalReason;
  }
  set reversalReason(value: string | undefined | null) {
    this.props.reversalReason = value;
    this.touch();
  }

  get reversalInitiator() {
    return this.props.reversalInitiator;
  }
  set reversalInitiator(value: ReversalInitiator | undefined | null) {
    this.props.reversalInitiator = value;
    this.touch();
  }

  get fromWalletId() {
    return this.props.fromWalletId;
  }

  get fromWallet() {
    return this.props.fromWallet;
  }

  get toWalletId() {
    return this.props.toWalletId;
  }

  get toWallet() {
    return this.props.toWallet;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      TransactionProps,
      'createdAt' | 'updatedAt' | 'status' | 'reversed'
    >,
    id?: UniqueEntityID,
  ) {
    const transaction = new Transaction(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        status: props.status ?? TransactionStatus.PENDING,
        reversed: props.reversed ?? false,
      },
      id,
    );

    return transaction;
  }
}

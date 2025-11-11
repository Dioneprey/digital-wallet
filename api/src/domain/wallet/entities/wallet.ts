import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';

export type WalletKey = 'id' | 'userId';

export interface WalletProps {
  userId: UniqueEntityID;
  balance: number;

  createdAt: Date;
  updatedAt?: Date | null;
}

export class Wallet extends Entity<WalletProps> {
  get userId() {
    return this.props.userId;
  }
  set userId(userId: UniqueEntityID) {
    this.props.userId = userId;
    this.touch();
  }

  get balance() {
    return this.props.balance;
  }
  set balance(balance: number) {
    this.props.balance = balance;
    this.touch();
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
    props: Optional<WalletProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const wallet = new Wallet(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return wallet;
  }
}

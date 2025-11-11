import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';
import { Wallet } from './wallet';

export type UserKey = 'id' | 'email';
export type UserInclude = {
  wallet?: boolean;
};

export interface UserProps {
  name: string;
  email: string;
  password: string;

  wallet?: Wallet;

  createdAt: Date;
  updatedAt?: Date | null;
}

export class User extends Entity<UserProps> {
  get name() {
    return this.props.name;
  }
  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  get email() {
    return this.props.email;
  }
  set email(email: string) {
    this.props.email = email;
    this.touch();
  }

  get password() {
    return this.props.password;
  }
  set password(password: string) {
    this.props.password = password;
    this.touch();
  }

  get wallet() {
    return this.props.wallet;
  }

  set wallet(wallet: Wallet | undefined) {
    this.props.wallet = wallet;
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

  static create(props: Optional<UserProps, 'createdAt'>, id?: UniqueEntityID) {
    const user = new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return user;
  }
}

import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';

export type CodeKey = 'id' | 'value';

export enum CodeType {
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

export interface CodeProps {
  type: CodeType;
  value: string;
  expiresAt: Date;
  userId: UniqueEntityID;

  createdAt: Date;
  updatedAt?: Date | null;
}

export class Code extends Entity<CodeProps> {
  get type() {
    return this.props.type;
  }
  set type(type: CodeType) {
    this.props.type = type;
    this.touch();
  }

  get value() {
    return this.props.value;
  }
  set value(value: string) {
    this.props.value = value;
    this.touch();
  }

  get expiresAt() {
    return this.props.expiresAt;
  }
  set expiresAt(expiresAt: Date) {
    this.props.expiresAt = expiresAt;
    this.touch();
  }

  get userId() {
    return this.props.userId;
  }
  set userId(userId: UniqueEntityID) {
    this.props.userId = userId;
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

  static create(props: Optional<CodeProps, 'createdAt'>, id?: UniqueEntityID) {
    const code = new Code(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return code;
  }
}

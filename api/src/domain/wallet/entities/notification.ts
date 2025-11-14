import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';

export type NotificationKey = 'id' | 'userId';

export interface NotificationProps {
  userId: UniqueEntityID;
  title: string;
  content: string;
  readedAt?: Date | null;

  createdAt: Date;
  updatedAt?: Date | null;
}

export class Notification extends Entity<NotificationProps> {
  get userId() {
    return this.props.userId;
  }
  set userId(userId: UniqueEntityID) {
    this.props.userId = userId;
    this.touch();
  }

  get title() {
    return this.props.title;
  }
  set title(title: string) {
    this.props.title = title;
    this.touch();
  }

  get content() {
    return this.props.content;
  }
  set content(content: string) {
    this.props.content = content;
    this.touch();
  }

  get readedAt() {
    return this.props.readedAt;
  }
  set readedAt(readedAt: Date | null | undefined) {
    this.props.readedAt = readedAt;
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
    props: Optional<NotificationProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const notification = new Notification(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return notification;
  }
}

import { User } from 'src/domain/wallet/entities/user';

export class UserPresenter {
  static toHTTP(user: User | null) {
    if (user === null) {
      return {};
    }

    return {
      id: user.id.toString(),
      name: user.name ?? null,
      email: user.email ?? null,
      createdAt: user.createdAt ?? null,
      updatedAt: user.updatedAt ?? null,
    };
  }
}

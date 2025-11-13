import { PaginationResponse } from 'src/core/types/pagination';
import {
  UserRepository,
  UserRepositoryFindByUniqueFieldProps,
  UserRepositoryFindManyProps,
} from 'src/domain/wallet/application/repositories/user.repository';
import { User } from 'src/domain/wallet/entities/user';

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

  async findByUniqueField({
    key,
    value,
  }: UserRepositoryFindByUniqueFieldProps): Promise<User | null> {
    const user = this.items.find((item) => {
      const fieldValue = (item as any)[key];
      return String(fieldValue) === String(value);
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findMany({
    pageIndex = 1,
    pageSize = 10,
    filters,
  }: UserRepositoryFindManyProps): Promise<PaginationResponse<User>> {
    let orders = [...this.items];

    if (filters) {
      if (filters.email) {
        orders = orders.filter((o) => o.email.includes(filters.email || ''));
      }
      if (filters.not) {
        orders = orders.filter((o) => o.id.toString() !== filters.not);
      }
    }

    const start = (pageIndex - 1) * pageSize;
    const paginated = orders.slice(start, start + pageSize);

    const totalCount = orders.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: paginated,
      pageIndex,
      totalCount,
      totalPages: totalPages,
    };
  }

  async save(user: User): Promise<User> {
    const index = this.items.findIndex((item) => item.id === user.id);

    this.items[index] = user;

    return user;
  }

  async delete(user: User): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === user.id);

    this.items.splice(itemIndex, 1);
  }

  async create(user: User) {
    this.items.push(user);

    return user;
  }
}

import { PaginationProps, PaginationResponse } from 'src/core/types/pagination';
import { User, UserInclude, UserKey } from '../../entities/user';

export interface UserRepositoryFindByUniqueFieldProps {
  key: UserKey;
  value: string;
  include?: UserInclude;
}

export interface UserRepositoryFindManyProps
  extends PaginationProps<{
    email?: string;
    not?: string;
  }> {}

export abstract class UserRepository {
  abstract findByUniqueField({
    key,
    value,
    include,
  }: UserRepositoryFindByUniqueFieldProps): Promise<User | null>;

  abstract findMany({
    pageIndex,
    pageSize,
    filters,
  }: UserRepositoryFindManyProps): Promise<PaginationResponse<User>>;

  abstract create(user: User): Promise<User>;
  abstract save(user: User): Promise<User>;
  abstract delete(user: User): Promise<void>;
}

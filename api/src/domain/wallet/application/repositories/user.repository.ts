import { User, UserInclude, UserKey } from '../../entities/user';

export interface UserRepositoryFindByUniqueFieldProps {
  key: UserKey;
  value: string;
  include?: UserInclude;
}

export abstract class UserRepository {
  abstract findByUniqueField({
    key,
    value,
    include,
  }: UserRepositoryFindByUniqueFieldProps): Promise<User | null>;

  abstract create(user: User): Promise<User>;
  abstract save(user: User): Promise<User>;
  abstract delete(user: User): Promise<void>;
}

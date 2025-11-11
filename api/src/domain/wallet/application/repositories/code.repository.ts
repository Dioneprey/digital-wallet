import { Code, CodeKey, CodeType } from '../../entities/code';

export interface CodeRepositoryFindByUniqueFieldProps {
  key: CodeKey;
  value: string;
}

export interface CodeRepositoryDeleteByUserIdProps {
  userId: string;
  type: CodeType;
}

export interface CodeRepositoryByUserIdProps {
  userId: string;
  type: CodeType;
}
export abstract class CodeRepository {
  abstract findByUniqueField({
    key,
    value,
  }: CodeRepositoryFindByUniqueFieldProps): Promise<Code | null>;

  abstract create(code: Code): Promise<Code>;
  abstract save(code: Code): Promise<Code>;

  abstract deleteByUserId({
    userId,
    type,
  }: CodeRepositoryDeleteByUserIdProps): Promise<void>;
  abstract delete(code: Code): Promise<void>;
}

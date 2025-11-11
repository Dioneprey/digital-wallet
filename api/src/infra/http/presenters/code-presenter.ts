import { Code } from 'src/domain/wallet/entities/code';

export class CodePresenter {
  static toHTTP(code: Code | null) {
    if (code === null) {
      return {};
    }

    return {
      id: code.id.toString(),
      userId: code.userId.toString(),
      value: code.value ?? null,
      type: code.type ?? null,
      createdAt: code.createdAt ?? null,
      expiresAt: code.expiresAt ?? null,
    };
  }
}

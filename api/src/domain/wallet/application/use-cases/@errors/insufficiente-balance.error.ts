import { UseCaseError } from 'src/core/errors/use-case-error';

export class InsufficienteBalanceError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`${identifier} has insufficiente balance.`);
  }
}

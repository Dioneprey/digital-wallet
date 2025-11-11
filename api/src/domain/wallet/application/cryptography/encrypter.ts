export abstract class Encrypter {
  abstract encrypt(payload: Record<any, any>): Promise<string>;
}

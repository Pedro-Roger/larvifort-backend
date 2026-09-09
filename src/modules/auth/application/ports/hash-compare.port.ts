// TASK 01 — porta de compare de hash.
// Interface para comparação de senhas (compare plain text com hash armazenado).

export const HASH_COMPARE_PORT = 'HASH_COMPARE_PORT';

export interface HashComparePort {
  compare(plain: string, hash: string): Promise<boolean>;
}

// TASK 01 — porta de hasher de senha.
// Interface para hash de senhas (com bcrypt cost 12).

export const PASSWORD_HASHER_PORT = 'PASSWORD_HASHER_PORT';

export interface PasswordHasherPort {
  hash(plainPassword: string): Promise<string>;
}

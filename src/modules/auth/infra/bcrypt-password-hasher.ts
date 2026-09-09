import { Inject, Injectable, Optional } from '@nestjs/common';
import { hash } from 'bcrypt';
import type { PasswordHasherPort } from '../application/ports/password-hasher.port';

export const BCRYPT_COST = 'BCRYPT_COST';

// TASK 01 slice 3d — adapter bcrypt da porta `PasswordHasherPort`.
// Cost 12 é o padrão de produção (combinado com o seed TASK 00f); o
// construtor permite cost menor para round-trip real em testes sem
// pagar 12 rounds. Uso de `bcrypt` confinado a `infra/`.

@Injectable()
export class BcryptPasswordHasher implements PasswordHasherPort {
  constructor(
    @Optional()
    @Inject(BCRYPT_COST)
    private readonly cost: number = 12,
  ) {}

  hash(plainPassword: string): Promise<string> {
    return hash(plainPassword, this.cost);
  }
}

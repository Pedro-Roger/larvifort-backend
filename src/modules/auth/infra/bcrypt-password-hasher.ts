import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import type { PasswordHasherPort } from '../application/ports/password-hasher.port';

// TASK 01 slice 3d — adapter bcrypt da porta `PasswordHasherPort`.
// Cost 12 é o padrão de produção (combinado com o seed TASK 00f); o
// construtor permite cost menor para round-trip real em testes sem
// pagar 12 rounds. Uso de `bcrypt` confinado a `infra/`.

@Injectable()
export class BcryptPasswordHasher implements PasswordHasherPort {
  constructor(private readonly cost: number = 12) {}

  hash(plainPassword: string): Promise<string> {
    return hash(plainPassword, this.cost);
  }
}
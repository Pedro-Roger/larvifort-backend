import { Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import type { HashComparePort } from '../application/ports/hash-compare.port';

// TASK 01 slice 3a — adapter bcrypt da porta `HashComparePort`.
// Único ponto que importa `bcrypt` no módulo auth (usecase recebe a
// porta via DI, nunca o bcrypt direto — unit do usecase segue sem
// dependência nativa). Cost 12 é o padrão de produção (seed TASK 00f);
// o cost só aparece no `hash` (registro), aqui só `compare`.

@Injectable()
export class BcryptHashCompare implements HashComparePort {
  compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return compare(plainPassword, passwordHash);
  }
}
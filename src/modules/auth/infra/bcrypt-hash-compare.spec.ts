import { hash } from 'bcrypt';
import { BcryptHashCompare } from './bcrypt-hash-compare';

// TASK 01 slice 3a — round-trip real contra o bcrypt (sem mocks).
// Cost 4 aqui é só velocidade de teste; produção/seed usam cost 12.
describe('BcryptHashCompare', () => {
  const sut = new BcryptHashCompare();

  it('retorna true quando a senha confere com o hash', async () => {
    const passwordHash = await hash('senha-secreta-123', 4);

    await expect(sut.compare('senha-secreta-123', passwordHash)).resolves.toBe(
      true,
    );
  });

  it('retorna false quando a senha não confere', async () => {
    const passwordHash = await hash('senha-secreta-123', 4);

    await expect(sut.compare('outra-senha', passwordHash)).resolves.toBe(false);
  });

  it('retorna false para senha vazia', async () => {
    const passwordHash = await hash('senha-secreta-123', 4);

    await expect(sut.compare('', passwordHash)).resolves.toBe(false);
  });
});

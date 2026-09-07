import { BcryptPasswordHasher } from './bcrypt-password-hasher';
import { compare } from 'bcrypt';

// Spec do hasher bcrypt (slice 3d): comportamento real, sem mocks.
// - cost 12 (padrão de produção) provado pelo prefixo `$2b$12$`.
// - custo reduzido (4) para round-trip real hash→compare sem pagar
//   12 rounds no unit.
describe('BcryptPasswordHasher', () => {
  it('gera hash com cost 12 por padrão e não contém a senha', async () => {
    const sut = new BcryptPasswordHasher();
    const hashed = await sut.hash('Lavifort@123');
    expect(hashed.startsWith('$2b$12$')).toBe(true);
    expect(hashed).not.toContain('Lavifort@123');
  });

  it('round-trip real: senha correta compara true e errada false', async () => {
    const sut = new BcryptPasswordHasher(4);
    const hashed = await sut.hash('Lavifort@123');
    await expect(compare('Lavifort@123', hashed)).resolves.toBe(true);
    await expect(compare('errada', hashed)).resolves.toBe(false);
  });
});

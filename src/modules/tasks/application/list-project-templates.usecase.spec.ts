import { ListProjectTemplatesUseCase } from './list-project-templates.usecase';
import { PROJECT_TEMPLATES } from '../domain/project-template';

describe('ListProjectTemplatesUseCase', () => {
  it('retorna a lista de templates canônicos pré-definidos', () => {
    const sut = new ListProjectTemplatesUseCase();
    const result = sut.execute();

    expect(result).toEqual(PROJECT_TEMPLATES);
    expect(result.length).toBeGreaterThanOrEqual(5);
    expect(result.some((t) => t.id === 'vazio')).toBe(true);
    expect(result.some((t) => t.id === 'pipeline-comercial')).toBe(true);
    expect(result.some((t) => t.id === 'atendimento')).toBe(true);
    expect(result.some((t) => t.id === 'operacoes')).toBe(true);
    expect(result.some((t) => t.id === 'desenvolvimento')).toBe(true);
  });
});

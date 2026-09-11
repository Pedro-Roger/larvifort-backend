import { NotFoundException } from '@nestjs/common';
import { GetProjectTemplateByIdUseCase } from './get-project-template-by-id.usecase';

describe('GetProjectTemplateByIdUseCase', () => {
  it('retorna o template pelo id existente', () => {
    const sut = new GetProjectTemplateByIdUseCase();
    const result = sut.execute('pipeline-comercial');

    expect(result).toBeDefined();
    expect(result.id).toBe('pipeline-comercial');
    expect(result.name).toBe('Pipeline Comercial');
    expect(result.columns.length).toBe(6);
  });

  it('lança NotFoundException quando o template não existe', () => {
    const sut = new GetProjectTemplateByIdUseCase();
    expect(() => sut.execute('template-inexistente')).toThrow(
      NotFoundException,
    );
  });
});

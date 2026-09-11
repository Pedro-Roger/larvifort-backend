import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateProjectUseCase } from './create-project.usecase';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { Project } from '../domain/task';

describe('CreateProjectUseCase', () => {
  const SAMPLE_PROJECT: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('cria projeto com sucesso', async () => {
    const findByName = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const projects = { findByName, create } as unknown as ProjectRepositoryPort;
    const sut = new CreateProjectUseCase(projects);

    const result = await sut.execute({ name: 'LarviFort CRM' });

    expect(findByName).toHaveBeenCalledWith('LarviFort CRM');
    expect(create).toHaveBeenCalledWith({
      name: 'LarviFort CRM',
      columns: undefined,
    });
    expect(result).toEqual(SAMPLE_PROJECT);
  });

  it('cria projeto usando template opt-in válido', async () => {
    const findByName = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const projects = { findByName, create } as unknown as ProjectRepositoryPort;
    const sut = new CreateProjectUseCase(projects);

    await sut.execute({
      name: 'Atendimento Helpdesk',
      templateId: 'atendimento',
    });

    expect(findByName).toHaveBeenCalledWith('Atendimento Helpdesk');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Atendimento Helpdesk',
        templateId: 'atendimento',
        columns: [
          { name: 'Novos', color: '#0ea5e9', order: 0 },
          { name: 'Em Atendimento', color: '#8b5cf6', order: 1 },
          { name: 'Aguardando Cliente', color: '#f59e0b', order: 2 },
          { name: 'Resolvidos', color: '#10b981', order: 3 },
        ],
      }),
    );
  });

  it('cria projeto com colunas customizadas ricas', async () => {
    const findByName = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const projects = { findByName, create } as unknown as ProjectRepositoryPort;
    const sut = new CreateProjectUseCase(projects);

    const customColumns = [
      { name: 'Entrada', color: '#3b82f6', order: 0 },
      { name: 'Saída', color: '#10b981', order: 1 },
    ];
    await sut.execute({
      name: 'Projeto Custom',
      columns: customColumns,
    });

    expect(create).toHaveBeenCalledWith({
      name: 'Projeto Custom',
      columns: customColumns,
    });
  });

  it('lança 404 quando templateId não existe', async () => {
    const findByName = jest.fn().mockResolvedValue(null);
    const create = jest.fn();
    const projects = { findByName, create } as unknown as ProjectRepositoryPort;
    const sut = new CreateProjectUseCase(projects);

    await expect(
      sut.execute({
        name: 'Projeto Invalido',
        templateId: 'template-fantasma',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(create).not.toHaveBeenCalled();
  });

  it('lança 409 quando nome de projeto já existe', async () => {
    const findByName = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const create = jest.fn();
    const projects = { findByName, create } as unknown as ProjectRepositoryPort;
    const sut = new CreateProjectUseCase(projects);

    await expect(sut.execute({ name: 'LarviFort CRM' })).rejects.toThrow(
      ConflictException,
    );

    expect(create).not.toHaveBeenCalled();
  });
});

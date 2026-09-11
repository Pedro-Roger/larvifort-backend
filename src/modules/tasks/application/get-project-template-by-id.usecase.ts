import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PROJECT_TEMPLATES,
  type ProjectTemplate,
} from '../domain/project-template';

@Injectable()
export class GetProjectTemplateByIdUseCase {
  execute(templateId: string): ProjectTemplate {
    const template = PROJECT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      throw new NotFoundException('Template de projeto não encontrado.');
    }
    return template;
  }
}

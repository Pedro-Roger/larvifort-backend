import { Injectable } from '@nestjs/common';
import {
  PROJECT_TEMPLATES,
  type ProjectTemplate,
} from '../domain/project-template';

@Injectable()
export class ListProjectTemplatesUseCase {
  execute(): ProjectTemplate[] {
    return PROJECT_TEMPLATES;
  }
}

import { Test } from '@nestjs/testing';
import { Controller, Get, INestApplication, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createOpenApiDocument, setupSwagger, SWAGGER_PATH } from './swagger';

class TestGuard {
  canActivate(): boolean {
    return true;
  }
}

@ApiTags('Teste')
@ApiBearerAuth('access-token')
@Controller('protected')
@UseGuards(TestGuard)
class ProtectedController {
  @Get()
  list(): string {
    return 'ok';
  }
}

describe('Swagger', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProtectedController],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
  });

  afterEach(async () => {
    await app.close();
  });

  it('gera documento OpenAPI com metadados, rota e Bearer JWT', () => {
    const document = createOpenApiDocument(app);

    expect(document.info).toMatchObject({
      title: 'Lavifort CRM API',
      version: '1.0',
    });
    expect(document.paths).toHaveProperty('/api/v1/protected');
    expect(document.components?.securitySchemes).toMatchObject({
      'access-token': {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    });
  });

  it('publica a interface Swagger em /api/docs', async () => {
    setupSwagger(app);
    await app.init();

    const server = app.getHttpAdapter().getInstance() as {
      router?: { stack?: Array<{ route?: { path?: string } }> };
    };
    const paths = server.router?.stack
      ?.map((layer) => layer.route?.path)
      .filter((path): path is string => Boolean(path));

    expect(SWAGGER_PATH).toBe('api/docs');
    expect(paths).toEqual(
      expect.arrayContaining(['/api/docs', '/api/docs-json']),
    );
  });
});

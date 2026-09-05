import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { knexProvider } from './knex.provider';

@Global()
@Module({
  providers: [PrismaService, knexProvider],
  exports: [PrismaService, knexProvider],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { PesquisasModule } from './modules/pesquisas/pesquisas.module';
import { UsersModule } from './modules/users/users.module';
import type { IncomingMessage, ServerResponse } from 'http';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: { colorize: true, singleLine: true },
              }
            : undefined,
        customProps: (req: IncomingMessage) => ({
          context: 'HTTP',
          method: req.method,
          url: req.url,
        }),
        autoLogging: true,
        serializers: {
          req: (req: IncomingMessage) => ({
            method: req.method,
            url: req.url,
            headers: req.headers,
          }),
          res: (res: ServerResponse) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
    AppointmentsModule,
    AuthModule,
    ClientsModule,
    CompaniesModule,
    DashboardModule,
    TeamsModule,
    TasksModule,
    PesquisasModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

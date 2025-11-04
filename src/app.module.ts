import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport, RmqOptions } from '@nestjs/microservices';
import { ServiceName } from './domain/enums/service-name.enum';
import { GatewayService } from './infrastructure/gateway/gateway.service';
import { ValidationHttpController } from './controllers/validation.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ClientsModule.registerAsync([
      {
        name: ServiceName.VALIDATION_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): RmqOptions => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_URL')],
            queue: config.get('VALIDATION_QUEUE') ?? 'validation_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },

      {
        name: ServiceName.CRYPT2P_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): RmqOptions => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_URL')],
            queue: config.get('CRYPT2P_QUEUE') ?? 'crypt2p_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [ValidationHttpController, HealthController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class AppModule {}
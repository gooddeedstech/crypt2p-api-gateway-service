import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport, RmqOptions } from '@nestjs/microservices';
import { ServiceName } from './domain/enums/service-name.enum';
import { GatewayService } from './infrastructure/gateway/gateway.service';
import { ValidationHttpController } from './controllers/validation.controller';
import { HealthController } from './controllers/health.controller';
import { OnboardingGatewayController } from './controllers/onboarding.controller';
import { PaystackWebhookController } from './controllers/webhooks/paystack.webhook';

import { ServeStaticModule } from '@nestjs/serve-static'; // ✅ added
import { join } from 'path'; // ✅ added

function buildRabbitUrl(config: ConfigService): string {
  const user = encodeURIComponent(config.get('RABBITMQ_USER') ?? 'guest');
  const pass = encodeURIComponent(config.get('RABBITMQ_PASS') ?? 'guest');
  const host = config.get('RABBITMQ_HOST') ?? 'localhost';
  const port = config.get('RABBITMQ_PORT') ?? '5672';
  const vhost = encodeURIComponent(config.get('RABBITMQ_VHOST') ?? '/');
  return `amqp://${user}:${pass}@${host}:${port}/${vhost}`;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ✅ Static asset hosting for your logo, brand files, etc.
     ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/assets',
      exclude: ['/api*', '/docs*'],
    }),

    ClientsModule.registerAsync([
      {
        name: ServiceName.VALIDATION_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): RmqOptions => ({
          transport: Transport.RMQ,
          options: {
            urls: [buildRabbitUrl(config)],
            queue: config.get('VALIDATION_QUEUE') ?? 'validation_queue',
            queueOptions: { durable: true },
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
            urls: [buildRabbitUrl(config)],
            queue: config.get('CRYPT2P_QUEUE') ?? 'crypt2p_queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [
    ValidationHttpController,
    OnboardingGatewayController,
    PaystackWebhookController,
    HealthController,
  ],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class AppModule {}
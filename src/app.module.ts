import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport, RmqOptions } from '@nestjs/microservices';
import { ServiceName } from './domain/enums/service-name.enum';
import { GatewayService } from './infrastructure/gateway/gateway.service';
import { ValidationHttpController } from './controllers/validation.controller';
import { HealthController } from './controllers/health.controller';
import { OnboardingGatewayController } from './controllers/onboarding.controller';
import { PaystackWebhookController } from './webhooks/paystack.webhook';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BushaGatewayController } from './controllers/busha.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { BushaGatewayWebhookController } from './webhooks/busha.webhook.controller';
import { BushaHmacUtil } from './utils/busha-hmac.util';
import { RubiesGatewayController } from './controllers/rubies.controller';

// ✅ Build RabbitMQ connection URL
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
    // ✅ 1. Load environment variables globally
    ConfigModule.forRoot({ isGlobal: true }),

    // ✅ 2. Register Passport and JWT globally
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),

    // ✅ 3. Serve static assets (optional)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/assets',
      exclude: ['/api*', '/docs*'],
    }),

    // ✅ 4. Register RMQ microservice clients
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
    BushaGatewayController,
    RubiesGatewayController,
    BushaGatewayWebhookController,
    HealthController,
  ],

 providers: [GatewayService, BushaHmacUtil, JwtStrategy],

  exports: [GatewayService],
})
export class AppModule {}
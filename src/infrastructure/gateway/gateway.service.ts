import {
  Inject,
  Injectable,
  Logger,
  HttpException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ServiceName } from '../../domain/enums/service-name.enum';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    @Inject(ServiceName.VALIDATION_SERVICE)
    private readonly validationClient: ClientProxy,
  ) {}

  private getClient(service: ServiceName): ClientProxy {
    switch (service) {
      case ServiceName.VALIDATION_SERVICE:
        return this.validationClient;
      default:
        throw new Error(`Unknown service: ${service}`);
    }
  }

  async send<T>(
    service: ServiceName,
    pattern: Record<string, any>,
    data: any,
  ): Promise<T> {
    const client = this.getClient(service);

    try {
      return await firstValueFrom(
        client.send<T>(pattern, data).pipe(timeout(20000)),
      );
    } catch (error: any) {
      // 👇 log the raw error (not just JSON.stringify)
      this.logger.error(
        `[Gateway Error] Service: ${service}, Pattern: ${JSON.stringify(
          pattern,
        )}`,
        error?.stack || error,
      );

      // 🔍 Nest + RpcException errors often look like:
      // { statusCode, message } or { error: '...', message, statusCode }
      const payload = error?.response || error?.error || error;

      const statusCode =
        payload?.statusCode ??
        payload?.status ??
        error?.statusCode ??
        error?.status;

      const message =
        payload?.message ??
        (typeof payload === 'string' ? payload : null) ??
        error?.message ??
        'Microservice internal error';

      // ✅ If microservice provided a proper shape, map to HttpException
      if (statusCode && message) {
        throw new HttpException(message, statusCode);
      }

      // ✅ Timeout handling
      if (error?.name === 'TimeoutError') {
        throw new HttpException(
          'Service timeout — microservice not responding',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }

      // ✅ Fallback
      throw new InternalServerErrorException('Microservice internal error');
    }
  }

  async ping(service: ServiceName) {
    try {
      const res = await this.send<any>(service, { cmd: 'health.ping' }, {});
      return res;
    } catch {
      return { status: 'error' };
    }
  }
}
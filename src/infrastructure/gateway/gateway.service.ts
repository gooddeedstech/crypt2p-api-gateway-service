import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ServiceName } from '../../domain/enums/service-name.enum';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    @Inject(ServiceName.VALIDATION_SERVICE) private readonly validationClient: ClientProxy,
  ) {}

  private getClient(service: ServiceName): ClientProxy {
    switch (service) {
      case ServiceName.VALIDATION_SERVICE:
        return this.validationClient;
      default:
        throw new Error(`Unknown service: ${service}`);
    }
  }

  async send<T>(service: ServiceName, pattern: Record<string, any>, data: any): Promise<T> {
    const client = this.getClient(service);
    try {
      return await firstValueFrom(client.send<T>(pattern, data).pipe(timeout(20000)));
    } catch (error: any) {
      this.logger.error(`[Gateway Error] Service: ${service}, Pattern: ${JSON.stringify(pattern)}, Error: ${error?.message || error}`);
      const message = error?.message || 'Internal server error';
      throw new Error(message);
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

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GatewayService } from '../infrastructure/gateway/gateway.service';
import { ServiceName } from '../domain/enums/service-name.enum';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly gateway: GatewayService) {}

  @Get()
  @ApiOperation({ summary: 'API Gateway health' })
  status() {
    return { status: 'ok' };
  }

  @Get('validation')
  @ApiOperation({ summary: 'Ping Validation microservice through RMQ' })
  async validationHealth() {
    const res = await this.gateway.ping(ServiceName.VALIDATION_SERVICE);
    return { service: 'validation', ...res };
  }

  @Get('health/crypto')
async crypt2pHealth() {
  try {
    const res = await this.gateway.send(
      ServiceName.CRYPT2P_SERVICE,
      { cmd: 'ping' },
      {}
    );

    return {
      service: 'crypt2p',
      status: 'up',
      message: 'RMQ communication OK ✅',
      details: res,
    };
  } catch (err: unknown) {
    const error = err as any; // ✅ Cast to any so we can read error.message
    console.error('❌ Crypt2P Health Check Failed:', error?.message);

    return {
      service: 'crypt2p',
      status: 'down',
      message: 'Failed to reach Crypt2P ❌',
      error: error?.message ?? 'Unknown error',
    };
  }
}
}

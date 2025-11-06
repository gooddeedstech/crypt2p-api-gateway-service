import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { GatewayService } from '../infrastructure/gateway/gateway.service';
import { ServiceName } from '../domain/enums/service-name.enum';

@ApiTags('Busha')
@Controller('busha')
export class BushaGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  @Get('assets')
  @ApiOperation({ summary: 'Get supported crypto assets from Busha' })
  listAssets() {
    return this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'busha.pairs' },
      {},
    );
  }

  @Get('price/:symbol')
  @ApiOperation({ summary: 'Get live crypto price from Busha' })
  @ApiParam({ name: 'symbol', example: 'BTC', description: 'Asset symbol' })
  getPrice(@Param('symbol') symbol: string) {
    return this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'busha.price' },
      { symbol },
    );
  }
}
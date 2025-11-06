import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags, ApiBody } from '@nestjs/swagger';
import { GatewayService } from '../infrastructure/gateway/gateway.service';
import { ServiceName } from '../domain/enums/service-name.enum';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { VerifyAccountDto, VerifyBvnDto } from '../dto/validation.dto';

@ApiTags('Validation')
@Controller('validation')
// @UseGuards(ApiKeyGuard)
export class ValidationHttpController {
  constructor(private readonly gateway: GatewayService) {}

  @Get('banks')
  @ApiOperation({ summary: 'Get bank list (Paystack upstream via Validation MS)' })
  @ApiQuery({ name: 'country', required: false, example: 'nigeria' })
  getBanks(@Query('country') country?: string) {
    return this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'banks.get' }, { country });
  }

  @Get('account/resolve')
  @ApiOperation({ summary: 'Resolve bank account number' })
  resolveAccount(@Query() dto: VerifyAccountDto) {
    return this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'account.verify' }, dto);
  }

  @Post('bvn/verify')
  @ApiOperation({ summary: 'Verify BVN + linked account' })
  @ApiBody({ type: VerifyBvnDto })
  verifyBvn(@Body() dto: VerifyBvnDto) {
    return this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'bvn.verify' }, dto);
  }

  
}

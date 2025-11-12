import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';
import { RubiesBvnValidationDto } from './dto/rubie-kyc.dto';


@ApiTags('Rubies-KYC')
@Controller('rubies/kyc')
export class RubiesKycGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  @Post('bvn')
  @ApiOperation({ summary: 'Validate BVN via Rubies KYC API' })
  async validateBvn(@Body() dto: RubiesBvnValidationDto) {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'rubies.kyc.validateBvn' },
        dto,
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to validate BVN',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
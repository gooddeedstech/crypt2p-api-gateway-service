import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';
import { NameEnquiryDto } from './dto/name-enquiry.dto';
import { FundTransferDto } from './dto/fund-transfer.dto';
import { ConfirmTransferDto } from './dto/confirm-transfer.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';


@ApiTags('Rubies Bank API')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) 
@Controller('rubies')
export class RubiesGatewayController {
  constructor(private readonly gateway: GatewayService) {}



  @Post('confirm-transfer')
  @ApiOperation({ summary: 'Confirm transfer status (TSQ)' })
  async confirmTransfer(@Body() dto: ConfirmTransferDto) {
    return this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'rubies.transfer.confirm' }, dto);
  }

  // @Post('webhook')
  // @ApiOperation({ summary: 'Handle Rubies webhook' })
  // async webhook(@Body() body: any) {
  //   return this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'rubies.webhook' }, body);
  // }

  //   @Get('map')
  // @ApiOperation({ summary: 'Map Paystack bank code to Rubies bank code' })
  // async mapBank(@Query('paystackCode') paystackCode: string) {
  //   return this.gateway.send(
  //     ServiceName.VALIDATION_SERVICE,
  //     { cmd: 'rubies.bank.map' },
  //     { paystackCode },
  //   ); 
  // }

  // @Get('all-mappings')
  // @ApiOperation({ summary: 'View all Paystack → Rubies mappings' })
  // async getAllMappings() {
  //   return this.gateway.send(
  //     ServiceName.VALIDATION_SERVICE,
  //     { cmd: 'rubies.bank.mappings' },
  //     {},
  //   );
  // }
}
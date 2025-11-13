import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';
import { AdminJwtAuthGuard } from '@/auth/admin-jwt-auth.guard';
import { CreateLedgerEntryDto, DebitLedgerEntryDto } from './dto/create-ledger.dto';
import { LedgerQueryDto } from './dto/query-ledger.dto';

@ApiTags('Ledger')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard)
@Controller('ledger')
export class LedgerGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  @Post('credit')
  @ApiOperation({ summary: 'Admin Credit Transaction ledger' })
  async credit(@Body() dto: CreateLedgerEntryDto) {
    return this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'ledger.credit' }, dto);
  }

//   @Post('debit')
//   @ApiOperation({ summary: 'Debit user ledger' })
//   async debit(@Body() dto: DebitLedgerEntryDto) {
//     return this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'ledger.debit' }, dto);
//   }

  @Get()
  @ApiOperation({ summary: 'List ledger entries with filters' })
  async list(@Query() query: LedgerQueryDto) {
    return this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'ledger.list' }, query);
  }
}
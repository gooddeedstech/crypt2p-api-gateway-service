import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';
import { AdminJwtAuthGuard } from '@/auth/admin-jwt-auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles, AdminRole } from '@/auth/roles.decorator';
import { CryptoTransactionStatus, CryptoTransactionType } from './enum/users.enum';
import { TransactionDashboardFilterDto, TransactionFilterDto } from './dto/transaction-filter.dto';

@ApiTags('Transaction Analytics')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
@Controller('admin/analytics/transactions')
export class TransactionAnalyticsGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  /* -----------------------------------------------------------
   📊 DASHBOARD (TOTAL / SUCCESS / PENDING / FAILED)
  ------------------------------------------------------------*/
  @Get('dashboard')
 @ApiOperation({ summary: 'Transaction dashboard overview' })
@ApiQuery({ name: 'date', required: false, enum: ['today', 'week', 'month', 'year'] })
@ApiQuery({ name: 'type', required: false, enum: CryptoTransactionType })
@ApiQuery({ name: 'asset', required: false })
async dashboard(@Query() dto: TransactionDashboardFilterDto) {
    try {
        console.log(dto)
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'analytics.transactions.dashboard' },
        dto,
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to load dashboard',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /* -----------------------------------------------------------
   🪙 SUMMARY BY ASSET
  ------------------------------------------------------------*/
 @Get('transactions/summary-by-asset')
@ApiQuery({ name: 'date', required: false })
@ApiQuery({ name: 'type', enum: CryptoTransactionType, required: false })
@ApiQuery({ name: 'asset', required: false })
@ApiQuery({ name: 'status', enum: CryptoTransactionStatus, required: false })
async getAssetSummary(@Query() dto: TransactionFilterDto) {
  try {
    console.log(dto)
    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'analytics.transactions.by-asset' },
      dto,
    );
  } catch (err: any) {
    throw new HttpException(
      err.message || 'Failed to fetch asset summary',
      err.statusCode || 500,
    );
  }
}

  /* -----------------------------------------------------------
   📜 TRANSACTION LOGS
  ------------------------------------------------------------*/
@Get('transactions/logs')
@ApiQuery({ name: 'startDate', required: false })
@ApiQuery({ name: 'endDate', required: false })
@ApiQuery({ name: 'type', required: false, enum: CryptoTransactionType })
@ApiQuery({ name: 'asset', required: false })
@ApiQuery({ name: 'status', required: false, enum: CryptoTransactionStatus })
@ApiQuery({ name: 'page', required: false, example: 1 })
@ApiQuery({ name: 'limit', required: false, example: 20 })
async getLogs(@Query() query: any) {
  try {
    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'analytics.transactions.logs' },
      query,
    );
  } catch (err: any) {
    throw new HttpException(
      err.message || 'Failed to fetch logs',
      err.statusCode || 500,
    );
  }
}
}
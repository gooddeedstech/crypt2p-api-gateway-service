import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';
import { AdminJwtAuthGuard } from '@/auth/admin-jwt-auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles, AdminRole } from '@/auth/roles.decorator';
import { AssetType, CryptoTransactionType } from './enum/users.enum';
import { DeviceStatus, DeviceType } from './dto/user-update.dto';


@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
@Controller('analytics')
export class AnalyticsGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  /* -----------------------------------------------------------
   ✅ DASHBOARD ANALYTICS OVERVIEW
  ------------------------------------------------------------*/
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get complete analytics dashboard',
    description:
      'Fetch full analytics data — users, transactions, assets, and trends. Optionally filter by transaction type (CRYPTO_TO_CASH or CASH_TO_CRYPTO).',
  })
 
  async getDashboard() {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE, // or ANALYTICS_SERVICE if separated
        { cmd: 'analytics.dashboard' },
        { },
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to fetch analytics dashboard',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /* -----------------------------------------------------------
   👥 USER REGISTRATION TREND (BAR CHART)
  ------------------------------------------------------------*/
  @Get('users/trend')
  @ApiOperation({
    summary: 'Get user registration trend',
    description: 'Returns daily user registration counts for the last N days.',
  })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  async getUserRegistrationTrend(@Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 30;
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'analytics.users.trend' },
        { days: numDays },
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to fetch user registration trend',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /* -----------------------------------------------------------
   🧍‍♂️ TOP ACTIVE USERS
  ------------------------------------------------------------*/
  @Get('users/top-active')
  @ApiOperation({
    summary: 'Get top active users',
    description: 'Returns top 10 users with the highest transaction count.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CryptoTransactionType,
    description: 'Filter by transaction type (optional)',
  })
  async getTopActiveUsers(@Query('type') type?: CryptoTransactionType) {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'analytics.users.top-active' },
        { type },
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to fetch top active users',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /* -----------------------------------------------------------
   💸 TOP USERS BY TRANSACTION VALUE
  ------------------------------------------------------------*/
  @Get('users/top-volume')
  @ApiOperation({
    summary: 'Get top users by transaction volume',
    description: 'Returns top 10 users with the highest total transaction value.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CryptoTransactionType,
    description: 'Filter by transaction type (optional)',
  })
  async getTopVolumeUsers(@Query('type') type?: CryptoTransactionType) {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'analytics.users.top-volume' },
        { type },
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to fetch top users by transaction volume',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /* -----------------------------------------------------------
   🪙 TRANSACTION SUMMARY BY ASSET & DAYS
  ------------------------------------------------------------*/
  @Get('transactions/by-asset-days')
  @ApiOperation({
    summary: 'Get transaction summary by asset and days',
    description:
      'Returns total transaction amount grouped by asset and day (for stacked or line charts).',
  })
  @ApiQuery({ name: 'days', required: false, example: 7 })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CryptoTransactionType,
    description: 'Filter by transaction type (optional)',
  })
  async getTransactionSummaryByAssetAndDays(
    @Query('days') days?: string,
    @Query('type') type?: CryptoTransactionType,
  ) {
    const numDays = days ? parseInt(days, 10) : 7;
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'analytics.transactions.by-asset-days' },
        { days: numDays, type },
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to fetch transaction analytics',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Get('transactions/asset-days-group')
@ApiOperation({
  summary: 'Get transaction summary grouped by asset per day (Chart)',
 })
@ApiQuery({ name: 'days', required: false, example: 7 })
@ApiQuery({
  name: 'type',
  required: false,
  enum: CryptoTransactionType,
  description: 'Filter by transaction type',
})
async assetDaysGrouped(
  @Query('days') days?: string,
  @Query('type') type?: CryptoTransactionType,
) {
  const d = days ? parseInt(days, 10) : 7;

  try {
    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'analytics.transactions.asset-days-group' },
      { days: d, type },
    );
  } catch (err: any) {
    throw new HttpException(
      err.message || 'Failed to fetch asset-days analytics',
      err.statusCode || HttpStatus.BAD_GATEWAY,
    );
  }
}

  @Get('assets')
  @ApiOperation({ summary: 'Get supported crypto assets from Busha (optional type filter)' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: AssetType,
    description: 'Optional asset type filter (COIN, TOKEN, STABLECOIN)',
  })
  listAssets(@Query('type') type?: AssetType) {
    return this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'busha.assets' },
      { type }, // ✅ pass type to microservice
    );
  }

    @Get('device-list')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', enum: DeviceType, required: false })
  @ApiQuery({ name: 'status', enum: DeviceStatus, required: false })
  async listDevices(@Query() query: any) {
    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'devices.list' },
      query,
    );
  }

  @Get('by-type')
  async devicesByType() {
    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'devices.by-type' },
      {},
    );
  }

  @Get('daily')
  @ApiQuery({ name: 'days', required: false })
  async dailyDevices(@Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 30;

    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'devices.daily' },
      { days: numDays },
    );
  }
}
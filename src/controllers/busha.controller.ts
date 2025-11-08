import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GatewayService } from '../infrastructure/gateway/gateway.service';
import { ServiceName } from '../domain/enums/service-name.enum';
import { GenerateDepositWalletDto } from './dto/generate-deposit-wallet.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DepositStatus } from './enum/users.enum';

@ApiTags('Crypto Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) 
@Controller('crypto-service') 
export class BushaGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  @Get('assets')
  @ApiOperation({ summary: 'Get supported crypto assets from Busha' })
  listAssets() {
    return this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'busha.assets' }, 
      {}, 
    ); 
  }

@Post('generate-crypto-2-cash-wallet-address')
  @ApiOperation({ summary: 'Generate a crypto deposit wallet address' })
  @ApiBody({ type: GenerateDepositWalletDto })
  async generateDepositWallet(@Req() req: any, @Body() body: GenerateDepositWalletDto) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'busha.wallet.generate' },
      {
        userId,
        ...body,
      },
    );
  }

   @Get('transaction_history/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get my crypto deposit records',
    description:
      'Returns all crypto deposit transactions made by the authenticated user. You can filter by status (e.g., PENDING, SUCCESSFUL, FAILED).',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: DepositStatus,
    description: 'Optional filter for deposit status',
  })
  async getMyDeposits(@Req() req: any, @Query('status') status?: DepositStatus) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const result = await this.gateway.send(
        ServiceName.VALIDATION_SERVICE, 
        { cmd: 'busha.deposit.findByUser' },
        { userId, status },
      );

      return {
        success: true,
        data: result,
      };
    } catch (err: any) {
      throw new HttpException(
        err?.message || 'Failed to fetch your deposits',
        err?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
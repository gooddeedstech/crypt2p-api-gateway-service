import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';

@ApiTags('User Wallets')
@Controller('wallet')
export class UserWalletGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  @Post('create')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a new wallet address for user' })
  async create(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id;
    if (!userId)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'wallet.create' },
      { userId, ...body },
    );
  }

  @Get('list')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all wallets for the user' })
  async list(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'wallet.list' },
      { userId },
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get wallet by ID' })
  async get(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'wallet.get' },
      {  id },
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete wallet by ID' })
  async delete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'wallet.delete' },
      {  id },
    );
  }
}
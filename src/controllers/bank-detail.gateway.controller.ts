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

@ApiTags('Users Bank Details')
@Controller('bank')
export class BankDetailGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  @Post('create')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a new bank account for the user' })
  async create(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id;
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return await this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'bank.create' }, { userId, ...body });
  }

  @Get('list')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all bank accounts for the user' })
  async list(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return await this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'bank.list' }, { userId });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a single bank account by ID' })
  async get(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return await this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'bank.get' }, {  id });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a bank account by ID' })
  async delete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return await this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'bank.delete' }, {  id });
  }
}
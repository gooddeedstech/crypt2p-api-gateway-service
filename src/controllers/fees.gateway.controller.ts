import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';


@ApiTags('Fees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) 
@Controller('fees')
export class FeesGatewayController {
  constructor(private readonly gateway: GatewayService) {}

//   @Post('create')
//   @ApiOperation({ summary: 'Create a new fee record' })
//   async create(@Body() dto: CreateFeeDto) {
//     try {
//       return await this.gateway.send(
//         ServiceName.VALIDATION_SERVICE,
//         { cmd: 'fees.create' },
//         dto,
//       );
//     } catch (err: any) {
//       throw new HttpException(
//         err.message || 'Failed to create fee record',
//         err.statusCode || HttpStatus.BAD_GATEWAY,
//       );
//     }
//   }

//   @Put('update')
//   @ApiOperation({ summary: 'Update fee record by asset' })
//   async update(@Body() dto: UpdateFeeDto) {
//     try {
//       return await this.gateway.send(
//         ServiceName.VALIDATION_SERVICE,
//         { cmd: 'fees.update' },
//         dto,
//       );
//     } catch (err: any) {
//       throw new HttpException(
//         err.message || 'Failed to update fee record',
//         err.statusCode || HttpStatus.BAD_GATEWAY,
//       );
//     }
//   }

  @Get('find')
  @ApiOperation({ summary: 'Find fee record by asset' })
  async findByAsset(@Query('asset') asset: string) {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'fees.find.byAsset' },
        { asset },
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to fetch fee record',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Get('all')
  @ApiOperation({ summary: 'List all fee records' })
  async findAll() {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'fees.all' },
        {},
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to fetch fees',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
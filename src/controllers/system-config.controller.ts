import { ServiceName } from '@/domain/enums/service-name.enum';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import {
  Controller,
  Get,
  Put,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { AdminJwtAuthGuard } from '@/auth/admin-jwt-auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { AdminRole, Roles } from '@/auth/roles.decorator';


@ApiTags('System Config')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
@Controller('system-config')
export class SystemConfigApiGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  // -------------------------------------------------------------------
  // GET ALL SYSTEM CONFIGS
  // -------------------------------------------------------------------
  @Get()
  @ApiOperation({ summary: 'Fetch all system configurations' })
  async getAllConfigs() {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE, // OR CONFIG_SERVICE (depending on your architecture)
        { cmd: 'system-config:get-all' },
        {},
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to fetch system configurations',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  // -------------------------------------------------------------------
  // UPDATE ALL SYSTEM CONFIGS
  // -------------------------------------------------------------------
  @Put()
  @ApiOperation({ summary: 'Update all system configurations' })
  @ApiBody({ type: UpdateSystemConfigDto })
  async updateConfigs(@Body() dto: UpdateSystemConfigDto) {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE, 
        { cmd: 'system-config:update-all' },
        dto,
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to update system configurations',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
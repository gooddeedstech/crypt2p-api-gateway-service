import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';
import { AdminJwtAuthGuard } from '@/auth/admin-jwt-auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles, AdminRole } from '@/auth/roles.decorator';
import { AdminListUsersDto } from './dto/user-update.dto';

@ApiTags('Admin - Manage Users')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
@Controller('admin/users')
export class AdminUserGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  /* -----------------------------------------------------------
   📌 GET ALL USERS
  ------------------------------------------------------------*/
  @Get()
  async listUsers(@Query() query: AdminListUsersDto) {
    try {
        console.log(query)
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE, // or USER_SERVICE
        { cmd: 'users.list' },
        query,
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to fetch users',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /* -----------------------------------------------------------
   📌 GET USER BY ID
  ------------------------------------------------------------*/
  @Get(':id')
  async getUser(@Param('id') userId: string) {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'users.find.byId' },
        { userId },
      );
    } catch (err: any) {
      throw new HttpException(err.message, err.statusCode || HttpStatus.BAD_GATEWAY);
    }
  }

  /* -----------------------------------------------------------
   🚫 DISABLE USER
  ------------------------------------------------------------*/
  @Post(':id/disable')
  async disableUser(
    @Param('id') userId: string,
    @Body() body: { reason?: string },
  ) {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'user.disable' },
        { userId, reason: body.reason },
      );
    } catch (err: any) {
      throw new HttpException(err.message, err.statusCode || HttpStatus.BAD_GATEWAY);
    }
  }

  /* -----------------------------------------------------------
   ✅ ENABLE USER
  ------------------------------------------------------------*/
  @Post(':id/enable')
  async enableUser(@Param('id') userId: string) {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'user.enable' },
        { userId },
      );
    } catch (err: any) {
      throw new HttpException(err.message, err.statusCode || HttpStatus.BAD_GATEWAY);
    }
  }
}
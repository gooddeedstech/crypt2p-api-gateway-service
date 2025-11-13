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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';
import { AdminJwtAuthGuard } from '@/auth/admin-jwt-auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles, AdminRole } from '@/auth/roles.decorator';
import { NotificationQueryDto, SendBulkNotificationDto } from './dto/send-bulk-notification.dto';


@ApiTags('Admin Manage Notifications')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
@Controller('admin/notifications')
export class AdminNotificationGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  /* -----------------------------------------------------------
     SEND BULK NOTIFICATION
  ------------------------------------------------------------*/
 @Post('send')
@ApiOperation({ summary: 'Send bulk or targeted notifications' })
async sendBulk(@Body() dto: SendBulkNotificationDto) {
  try {
    console.log(dto)
    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'notifications.bulk-send' },
      dto,      // <-- FIXED
    );
  } catch (err: any) {
    throw new HttpException(
      err.message || 'Failed to send notification',
      err.statusCode || HttpStatus.BAD_GATEWAY,
    );
  }
}

  /* -----------------------------------------------------------
     Get ADMIN-SENT NOTIFICATIONS (Paginated)
  ------------------------------------------------------------*/
  @Get('sent')
  @ApiOperation({ summary: 'List notifications sent by admin (paginated)' })
  async getAdminNotifications(@Query() query: NotificationQueryDto) {
    try {
      const payload = {
        page: query.page || 1,
        limit: query.limit || 20,
      };

      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'notifications.admin.list' },
        payload,
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to fetch notifications',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
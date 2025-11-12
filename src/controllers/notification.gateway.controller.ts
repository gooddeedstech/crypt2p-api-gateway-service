import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send notification to a user' })
  async send(@Body() body: any) {
    return await this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'notification.send' }, body);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user notifications' })
  async list(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return await this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'notification.list' }, { userId });
  }

  @Patch(':id/read')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return await this.gateway.send(ServiceName.VALIDATION_SERVICE, { cmd: 'notification.read' }, { userId, id });
  }
}
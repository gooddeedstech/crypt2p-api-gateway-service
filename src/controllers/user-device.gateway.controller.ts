import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeviceStatus, DeviceType } from './dto/user-update.dto';


@ApiTags('User Devices')
@Controller('devices')
export class UserDeviceGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  /** ✅ Register or update device token */
  @Post('register')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Register or update a user device',
    description:
      'Saves or updates the user’s FCM token, device type, and metadata for push notifications.',
  })
  @ApiBody({
    schema: {
      example: {
        fcmToken: 'djs82n3nsjsk3n32...',
        deviceType: DeviceType.ANDROID,
        deviceName: 'Samsung S24 Ultra',
        osVersion: 'Android 15',
      },
    },
  })
  async registerDevice(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'device.register' },
        { userId, lastIp: req.ip, ...body },
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to register device',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /** ✅ Get all user devices */
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List all user devices',
    description: 'Returns all registered devices for the current user.',
  })
  async getUserDevices(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'device.find.by.user' },
      { userId },
    );
  }

  /** ✅ Remove a specific device by FCM token */
  @Delete('remove')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Remove a user device',
    description:
      'Deletes a specific device record, usually when a user logs out from a device.',
  })
  @ApiBody({
    schema: {
      example: { fcmToken: 'djs82n3nsjsk3n32...' },
    },
  })
  async removeDevice(@Body() body: any) {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'device.remove' },
        body,
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to remove device',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /** ✅ Remove all devices for user (logout from all) */
  @Delete('remove-all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Remove all devices for user',
    description:
      'Deletes all registered devices for the authenticated user (used for “Logout from All Devices”).',
  })
  async removeAllDevices(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'device.remove.all' },
        { userId },
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to remove all devices',
        err.statusCode || HttpStatus.BAD_GATEWAY,
      );
    }
  }


}
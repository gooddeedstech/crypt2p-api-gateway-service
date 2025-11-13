import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Patch, Param, Req } from '@nestjs/common';
import { ApiTags, ApiBody, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';
import { AdminJwtAuthGuard } from '@/auth/admin-jwt-auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { AdminRole, Roles } from '@/auth/roles.decorator';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';
import { ChangeAdminPasswordDto, ResetAdminPasswordDto } from './dto/admin-password.dto';


@ApiTags('Administrator Management System')
@Controller('admin/auth')
export class AdminAuthGatewayController {
  constructor(private readonly gateway: GatewayService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiBody({
    schema: {
      example: {
        email: 'admin@crypt2p.com',
        password: 'StrongPassword123!',
      },
    },
  })
  async adminLogin(@Body() body: { email: string; password: string }) {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'admin.login' },
        body,
      );
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Login failed',
        err.statusCode || HttpStatus.UNAUTHORIZED,
      );
    }
  }

 @Post('create')
@ApiBearerAuth()
@ApiOperation({ summary: 'Create new admin (super admin only)' })
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
async createAdmin(@Body() body: CreateAdminUserDto) {
  try {
    return await this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'admin.create' },
      body,
    );
  } catch (err: any) {
    throw new HttpException(err.message, err.statusCode || 400);
  }
}

@Patch('update/:id')
@ApiBearerAuth()
@ApiOperation({ summary: 'Update existing admin' })
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
async updateAdmin(@Param('id') id: string, @Body() body: UpdateAdminUserDto) {
  return await this.gateway.send(
    ServiceName.VALIDATION_SERVICE,
    { cmd: 'admin.update' },
    { id, ...body },
  );
}


  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change admin password (authenticated user)' })
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.SUPPORT) 
  async changePassword(@Body() dto: ChangeAdminPasswordDto, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'admin.change.password' },
      { userId, dto },
    );
  }

  @Post('verify-token')
  @ApiOperation({ summary: 'Verify admin JWT token' })
  async verifyToken(@Body() body: { token: string }) {
    try {
      return await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'admin.verifyToken' },
        body,
      );
    } catch (err: any) {
      throw new HttpException(err.message, err.statusCode || 401);
    }
  }
}
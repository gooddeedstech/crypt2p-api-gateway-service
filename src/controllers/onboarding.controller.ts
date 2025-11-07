import { Body, Controller, HttpException, HttpStatus, InternalServerErrorException, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GatewayService } from '../infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';
import { ConfirmEmailVerificationDto, ConfirmResetDto, LoginDto, LoginPinDto, RegisterDto, SetPinDto, StartEmailVerificationDto, StartResetDto } from './dto/onboarding.dto';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingGatewayController {
  constructor(private readonly gateway: GatewayService) {}

 @Post('email/start')
@ApiOperation({ summary: 'Start email OTP verification' })
startEmail(@Body() dto: StartEmailVerificationDto) {
  return this.gateway.send(
    ServiceName.VALIDATION_SERVICE,
    { cmd: 'onboarding.email.start' },
    dto,
  );
}

@Post('email/confirm')
@ApiOperation({ summary: 'Confirm email OTP for pre-registration' })
confirmEmail(@Body() dto: ConfirmEmailVerificationDto) {
  return this.gateway.send(
    ServiceName.VALIDATION_SERVICE,
    { cmd: 'onboarding.email.confirm' },
    dto,
  );
}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user (after email confirmation)' })
  register(@Body() dto: RegisterDto) {
    return this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'onboarding.register' },
      dto,
    );
  }

@Post('login/password')
@ApiOperation({ summary: 'Login with email and password' })
loginPassword(@Body() dto: LoginDto) {
  return this.gateway.send(
    ServiceName.VALIDATION_SERVICE,
    { cmd: 'onboarding.login.password' },
    dto,
  );
}

@Post('pin/set')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set login PIN' })
  @ApiBody({ type: SetPinDto })
  async setPin(@Req() req: any, @Body() dto: SetPinDto) {
    // ✅ 1. Extract userId from JWT
    const userId = req.user?.id;

    // ✅ 2. If no JWT or invalid token → throw 401
    if (!userId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'User not authenticated. Please log in again.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // ✅ 3. Forward to Validation microservice
    return this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'onboarding.pin.set' },
      { userId, ...dto },
    );
  }

@Post('login/pin')
@ApiOperation({ summary: 'Login using PIN' })
async loginPin(@Body() dto: LoginPinDto) {
  return this.gateway.send(
    ServiceName.VALIDATION_SERVICE,
    { cmd: 'onboarding.login.pin' },
    dto,
  );
}

  @Post('password/reset/start')
  @ApiOperation({ summary: 'Start password reset flow' })
  startReset(@Body() dto: StartResetDto) {
    return this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'onboarding.reset.start' },
      dto,
    );
  }

  @Post('password/reset/confirm')
  @ApiOperation({ summary: 'Confirm reset OTP and update password' })
  confirmReset(@Body() dto: ConfirmResetDto) {
    return this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'onboarding.reset.confirm' },
      dto,
    );
  }
}
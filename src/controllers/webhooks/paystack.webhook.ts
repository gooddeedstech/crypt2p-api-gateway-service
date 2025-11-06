import { ServiceName } from "@/domain/enums/service-name.enum";
import { GatewayService } from "@/infrastructure/gateway/gateway.service";
import { Controller, ForbiddenException, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { createHmac } from 'crypto';

@ApiTags('Paystack-Webhook')
@Controller('webhook/paystack')
export class PaystackWebhookController {
  constructor(private readonly gateway: GatewayService) {}

  @Post('verification')
  async handleVerification(@Req() req: Request) {

    // ✅ Validate Paystack signature
   const signature = req.headers['x-paystack-signature'] as string;

    const computed = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(JSON.stringify(req.body))
    .digest('hex');

    if (signature !== computed) {
    throw new ForbiddenException('Invalid Paystack webhook signature');
    }

    if (signature !== computed) {
      throw new ForbiddenException('Invalid signature');
    }

    // ✅ Forward entire event to validation microservice
    return this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'paystack.kyc.webhook' },
      req.body
    );
  }
}
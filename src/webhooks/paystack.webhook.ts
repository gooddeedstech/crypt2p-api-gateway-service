import {
  Controller,
  Post,
  Req,
  Headers,
  ForbiddenException,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { createHmac } from 'crypto';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { ServiceName } from '@/domain/enums/service-name.enum';

@ApiTags('Paystack Webhooks')
@Controller('webhook/paystack')
export class PaystackWebhookController {
  private readonly logger = new Logger(PaystackWebhookController.name);

  constructor(private readonly gateway: GatewayService) {}

  /**
   * ✅ Handle Paystack KYC / transaction webhook
   */
  @Post('verification')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive and verify Paystack webhook securely' })
  async handleWebhook(
    @Req() req: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    // 🧩 Ensure we got the signature header
    if (!signature) {
      this.logger.warn('🚨 Missing x-paystack-signature header');
      throw new ForbiddenException('Missing Paystack signature');
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      this.logger.error('❌ PAYSTACK_SECRET_KEY not set in environment');
      throw new ForbiddenException('Server misconfiguration');
    }

    // ✅ Compute HMAC-SHA512 using *raw body*
    const rawBody = req.rawBody
      ? req.rawBody
      : JSON.stringify(req.body); // fallback if middleware not attached
    const computed = createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    // 🧾 Log for traceability
    this.logger.log(`📩 Incoming Paystack Webhook`);
    this.logger.log(`🔐 Received signature: ${signature}`);
    this.logger.log(`🔐 Computed signature: ${computed}`);

    // 🚫 If invalid, reject immediately
    if (signature !== computed) {
      this.logger.error('❌ Invalid Paystack webhook signature');
      throw new ForbiddenException('Invalid Paystack webhook signature');
    }

    // ✅ Verified — forward to microservice for processing
    const payload = req.body;
    this.logger.log(
      `✅ Paystack webhook verified successfully → Forwarding to Validation Service`,
    );

    return this.gateway.send(
      ServiceName.VALIDATION_SERVICE,
      { cmd: 'paystack.kyc.webhook' },
      payload,
    );
  }
}
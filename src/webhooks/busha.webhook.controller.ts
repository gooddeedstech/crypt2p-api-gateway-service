import { ServiceName } from '@/domain/enums/service-name.enum';
import { GatewayService } from '@/infrastructure/gateway/gateway.service';
import { BushaHmacUtil } from '@/utils/busha-hmac.util';
import {
  Controller,
  Post,
  Headers,
  Req,
  Logger,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('v1/webhooks')
export class BushaGatewayWebhookController {
  private readonly logger = new Logger(BushaGatewayWebhookController.name);

  constructor(
    private readonly gateway: GatewayService,
    private readonly hmacUtil: BushaHmacUtil,
  ) {}

  /**
   * ✅ Handles Busha webhook events (buy/sell).
   * Dynamically routes to the correct service based on event type.
   */
  @Post('crypto-transfer')
  @ApiOperation({ summary: 'Busha crypto transfer webhook (gateway → microservice)' })
  @HttpCode(200)
  async handleWebhook(@Req() req: any, @Headers() headers: Record<string, string>) {
    const rawBody = req.rawBody;
    const payload = req.body;
    const event = payload?.event;
    const data = payload?.data;

    this.logger.log(`📩 Incoming Busha Webhook: ${JSON.stringify(payload)}`);

    // ✅ Step 1: Retrieve signature (handle different header names)
    const signature =
      headers['x-busha-signature'] ||
      headers['busha-signature'] ||
      headers['X-Busha-Signature'] ||
      null;

    if (!signature) {
      this.logger.warn('⚠️ Missing Busha signature header — skipping verification (sandbox mode).');
    } else {
      try {
        this.hmacUtil.verifySignature(rawBody, signature);
        this.logger.log('✅ Busha HMAC signature verified');
      } catch (err) {
        this.logger.error(`❌ Invalid Busha Signature: ${err.message}`);
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    // ✅ Step 2: Validate payload
    if (!event || !data?.id) {
      this.logger.error('❌ Invalid webhook payload: Missing event or data.id');
      throw new UnauthorizedException('Invalid webhook payload');
    }

    // ✅ Step 3: Determine routing (buy vs. sell)
    const SELL_EVENTS = [
      'transfer.pending',
      'transfer.processing',
      'transfer.funds_received',
    ];

    const BUY_EVENTS = [
      'transfer.funds_converted',
      'transfer.outgoing_payment_sent',
      'transfer.funds_delivered',
    ];

    let targetCmd: string | null = null;
    let targetService = ServiceName.VALIDATION_SERVICE;

    if (BUY_EVENTS.includes(event)) {
      targetCmd = 'busha.buy.webhook';
      this.logger.log(`🟢 Detected BUY event → ${event}`);
    } else if (SELL_EVENTS.includes(event)) {
      targetCmd = 'busha.sell.webhook';
      this.logger.log(`🟣 Detected SELL event → ${event}`);
    } else {
      this.logger.warn(`⚠️ Unknown Busha event "${event}" (ignored)`);
      return { ignored: true };
    }

    // ✅ Step 4: Forward to the appropriate microservice
    try {
      await this.gateway.send(targetService, { cmd: targetCmd }, payload);
      this.logger.log(`📤 Forwarded Busha event "${event}" → ${targetCmd}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`❌ Microservice forwarding failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
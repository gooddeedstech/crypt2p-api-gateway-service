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
   * ✅ Receives Busha webhooks, verifies HMAC signature,
   * then forwards verified payload to the main microservice.
   */
  @Post('crypto-transfer')
  @ApiOperation({ summary: 'Busha crypto transfer webhook (gateway → validation service)' })
  @HttpCode(200)
  async handleWebhook(
    @Req() req: any,
    @Headers('x-busha-signature') signature: string,
  ) {
    const rawBody = req.rawBody ;
    const payload = req.body;

    console.log('🔐 Loaded BUSHA_WEBHOOK_SECRET:', process.env.BUSHA_WEBHOOK_SECRET);

    this.logger.log(`📩 Incoming Busha Webhook: ${JSON.stringify(payload)}`);
console.log('RAW BODY (hex):', req.rawBody.toString('hex'));


    // ✅ Step 1: Verify HMAC signature
    try {
      this.hmacUtil.verifySignature(rawBody, signature);
      this.logger.log('✅ Busha HMAC signature verified');
    } catch (err) {
      this.logger.error(`❌ Invalid Busha Signature: ${err.message}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // ✅ Step 2: Validate payload
    const event = payload?.event;
    const data = payload?.data;
    if (!event || !data?.id) {
      throw new UnauthorizedException('Invalid webhook payload');
    }

    // ✅ Step 3: Forward to main microservice (Validation / Wallet Service)
    try {
      await this.gateway.send(
        ServiceName.VALIDATION_SERVICE,
        { cmd: 'busha.webhook.handle' },
        payload,
      );

      this.logger.log(`📤 Forwarded webhook ${event} → validation microservice`);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`❌ Microservice forwarding failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
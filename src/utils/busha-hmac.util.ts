import * as crypto from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class BushaHmacUtil {
  private readonly secret = process.env.BUSHA_WEBHOOK_SECRET || '';

  verifySignature(rawBody: Buffer, receivedSignature: string): void {
    if (!this.secret) throw new Error('BUSHA_WEBHOOK_SECRET not configured');
    if (!receivedSignature) throw new UnauthorizedException('Missing Busha signature header');

    const hmac = crypto.createHmac('sha256', Buffer.from(this.secret));
    hmac.update(rawBody);
   // const expected = hmac.digest('base64'); // convert to base64 string
     const expected = crypto
    .createHmac('sha256', process.env.BUSHA_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('base64');

    console.log('🔐 EXPECTED SIGNATURE:', expected);
    console.log('📩 RECEIVED SIGNATURE:', receivedSignature);

    if (expected !== receivedSignature.trim()) {
      throw new UnauthorizedException('Invalid Busha webhook signature');
    }
  }
}
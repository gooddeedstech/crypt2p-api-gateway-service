import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const headerKey = (req.headers['x-api-key'] || req.headers['x_api_key']) as string | undefined;
    const expected = process.env.API_KEY;
    if (!expected) return true; // if unset, allow (dev)
    if (!headerKey || headerKey !== expected) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    return true;
  }
} 

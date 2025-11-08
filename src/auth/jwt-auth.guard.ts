
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    console.log('🔐 Checking JWT Guard, headers:', req.headers.authorization);
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    console.log('👤 Guard handleRequest:', { err, user, info });
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    try {
      const result = (await super.canActivate(context)) as boolean;
      return result;
    } catch (err) {
      // Catch any passport errors (expired token, invalid token)
      console.error('JWT Error:', err.message);
      throw new UnauthorizedException('Access token is missing or invalid');
    }
  }

  handleRequest(err: any, user: any, info: any) {
    // called only if canActivate passed
    if (err || !user) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }
    return user;
  }
}

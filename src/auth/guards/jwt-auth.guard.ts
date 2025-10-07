import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard
 * ----------------
 * This guard uses Passport's 'jwt' strategy to protect routes.
 * If the access token is missing, expired, or invalid, it throws 401 Unauthorized.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  
  // Optionally, we can customize the response for unauthorized requests
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Access token is missing or invalid');
    }
    return user; // Injected into request.user
  }

  /**
   * Can add additional context-based checks if needed
   * e.g., check user roles or account status
   */
  canActivate(context: ExecutionContext) {
    // Call default JwtAuthGuard logic
    return super.canActivate(context);
  }
}

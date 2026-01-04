import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseService } from '../firebase/firebase.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    // Development bypass: if AUTH_DISABLED is true, attach DEV_USER identity
    if (process.env.AUTH_DISABLED === 'true') {
      this.logger.debug('Auth disabled - attaching DEV_USER identity');
      request.user = {
        firebaseUid: 'DEV_USER',
        phoneNumber: null,
      };
      return true;
    }

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);

      // Attach user identity to request object for downstream use
      request.user = {
        firebaseUid: decodedToken.uid,
        phoneNumber: decodedToken.phone_number || null,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        firebaseToken: decodedToken,
      };

      return true;
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

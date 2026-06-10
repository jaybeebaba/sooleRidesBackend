import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class FullyVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is not active');
    }

    if (
      !user.isEmailVerified ||
      !user.isPhoneVerified ||
      !user.isIdentityVerified ||
      !user.isFaceVerified
    ) {
      throw new ForbiddenException(
        'Complete email, phone, identity, and face verification before using this feature',
      );
    }

    return true;
  }
}
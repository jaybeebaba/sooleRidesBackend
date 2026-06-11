import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { OAuth2Client } from 'google-auth-library';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { StringValue } from 'ms';
import {
  AuthProvider,
  VerificationPurpose,
  VerificationType,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { RegisterEmailDto } from './dto/register-email.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AppleAuthDto } from './dto/apple-auth.dto';
import { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPhoneOtpDto } from './dto/request-phone-otp.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyIdentityDto } from './dto/verify-identity.dto';
import { VerifyFaceDto } from './dto/verify-face.dto';

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerEmail(dto: RegisterEmailDto) {
    const email = dto.email.toLowerCase();

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(dto.phone ? [{ phone: dto.phone }] : [])],
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email,
        phone: dto.phone,
        passwordHash,
        accounts: {
          create: {
            provider: AuthProvider.EMAIL,
            providerUserId: email,
            email,
          },
        },
      },
    });

    await this.createVerificationCode({
      userId: user.id,
      email,
      type: VerificationType.EMAIL,
      purpose: VerificationPurpose.VERIFY_ACCOUNT,
    });

    return this.authResponse(user);
  }

  async loginEmail(dto: LoginEmailDto) {
    const email = dto.email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid login details');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid login details');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    return this.authResponse(user);
  }

  async googleAuth(dto: GoogleAuthDto) {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      throw new BadRequestException('GOOGLE_CLIENT_ID is not configured');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: dto.idToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const providerUserId = payload.sub;
    const email = payload.email.toLowerCase();

    const existingAccount = await this.prisma.authAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.GOOGLE,
          providerUserId,
        },
      },
      include: { user: true },
    });

    if (existingAccount) {
      return this.authResponse(existingAccount.user);
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          fullName: payload.name ?? 'Google User',
          email,
          isEmailVerified: payload.email_verified ?? false,
          accounts: {
            create: {
              provider: AuthProvider.GOOGLE,
              providerUserId,
              email,
            },
          },
        },
      });
    } else {
      await this.prisma.authAccount.create({
        data: {
          userId: user.id,
          provider: AuthProvider.GOOGLE,
          providerUserId,
          email,
        },
      });

      if (payload.email_verified && !user.isEmailVerified) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true },
        });
      }
    }

    return this.authResponse(user);
  }

  async appleAuth(dto: AppleAuthDto) {
    const appleClientId = process.env.APPLE_CLIENT_ID;

    if (!appleClientId) {
      throw new BadRequestException('APPLE_CLIENT_ID is not configured');
    }

    const appleJWKS = createRemoteJWKSet(
      new URL('https://appleid.apple.com/auth/keys'),
    );

    const { payload } = await jwtVerify(dto.identityToken, appleJWKS, {
      issuer: 'https://appleid.apple.com',
      audience: appleClientId,
    });

    const providerUserId = payload.sub;

    if (!providerUserId) {
      throw new UnauthorizedException('Invalid Apple token');
    }

    const email =
      typeof payload.email === 'string'
        ? payload.email.toLowerCase()
        : undefined;

    const existingAccount = await this.prisma.authAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.APPLE,
          providerUserId,
        },
      },
      include: { user: true },
    });

    if (existingAccount) {
      return this.authResponse(existingAccount.user);
    }

    let user = email
      ? await this.prisma.user.findUnique({ where: { email } })
      : null;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          fullName: dto.fullName ?? 'Apple User',
          email,
          isEmailVerified: Boolean(email),
          accounts: {
            create: {
              provider: AuthProvider.APPLE,
              providerUserId,
              email,
            },
          },
        },
      });
    } else {
      await this.prisma.authAccount.create({
        data: {
          userId: user.id,
          provider: AuthProvider.APPLE,
          providerUserId,
          email,
        },
      });

      if (email && !user.isEmailVerified) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true },
        });
      }
    }

    return this.authResponse(user);
  }

  async requestEmailVerification(dto: RequestEmailVerificationDto) {
    const email = dto.email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified' };
    }

    const code = await this.createVerificationCode({
      userId: user.id,
      email,
      type: VerificationType.EMAIL,
      purpose: VerificationPurpose.VERIFY_ACCOUNT,
    });

    return {
      message: 'Verification code generated',
      devCode: code,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const email = dto.email.toLowerCase();

    const record = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        type: VerificationType.EMAIL,
        purpose: VerificationPurpose.VERIFY_ACCOUNT,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired code');
    }

    const valid = await argon2.verify(record.codeHash, dto.code);

    if (!valid) {
      throw new BadRequestException('Invalid or expired code');
    }

    const user = await this.prisma.user.update({
      where: { email },
      data: { isEmailVerified: true },
    });

    await this.prisma.verificationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return {
      message: 'Email verified successfully',
      userId: user.id,
    };
  }

  async requestPhoneOtp(dto: RequestPhoneOtpDto) {
    let user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          accounts: {
            create: {
              provider: AuthProvider.PHONE,
              providerUserId: dto.phone,
              phone: dto.phone,
            },
          },
        },
      });
    }

    const code = await this.createVerificationCode({
      userId: user.id,
      phone: dto.phone,
      type: VerificationType.PHONE,
      purpose: VerificationPurpose.LOGIN,
    });

    return {
      message: 'OTP generated',
      devCode: code,
    };
  }

  async verifyPhoneOtp(dto: VerifyPhoneOtpDto) {
    const record = await this.prisma.verificationCode.findFirst({
      where: {
        phone: dto.phone,
        type: VerificationType.PHONE,
        purpose: VerificationPurpose.LOGIN,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const valid = await argon2.verify(record.codeHash, dto.code);

    if (!valid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.update({
      where: { phone: dto.phone },
      data: { isPhoneVerified: true },
    });

    await this.prisma.verificationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return this.authResponse(user);
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: { sub: string; role: string };

    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    const matchedToken = await this.findMatchingRefreshToken(
      dto.refreshToken,
      storedTokens,
    );

    if (!matchedToken) {
      throw new UnauthorizedException('Refresh token not recognized');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revokedAt: new Date() },
    });

    return this.authResponse(user);
  }

  async logout(dto: RefreshTokenDto) {
    let payload: { sub: string; role: string };

    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      });
    } catch {
      return { message: 'Logged out successfully' };
    }

    const storedTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
      },
    });

    const matchedToken = await this.findMatchingRefreshToken(
      dto.refreshToken,
      storedTokens,
    );

    if (matchedToken) {
      await this.prisma.refreshToken.update({
        where: { id: matchedToken.id },
        data: { revokedAt: new Date() },
      });
    }

    return { message: 'Logged out successfully' };
  }

  private async createVerificationCode(params: {
    userId?: string;
    email?: string;
    phone?: string;
    type: VerificationType;
    purpose: VerificationPurpose;
  }) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.verificationCode.create({
      data: {
        userId: params.userId,
        email: params.email,
        phone: params.phone,
        codeHash: await argon2.hash(code),
        type: params.type,
        purpose: params.purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return code;
  }

  private async findMatchingRefreshToken(
    plainToken: string,
    storedTokens: { id: string; tokenHash: string }[],
  ) {
    for (const storedToken of storedTokens) {
      const isValid = await argon2.verify(storedToken.tokenHash, plainToken);

      if (isValid) {
        return storedToken;
      }
    }

    return null;
  }

  private async authResponse(user: {
    id: string;
    email: string | null;
    phone: string | null;
    fullName: string | null;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  }) {
    const payload = {
      sub: user.id,
      role: user.role,
    };

    const accessTokenExpiresIn: StringValue =
      (process.env.JWT_EXPIRES_IN as StringValue) || '15m';

    const refreshTokenExpiresIn: StringValue =
      (process.env.JWT_REFRESH_EXPIRES_IN as StringValue) || '7d';

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'access_secret',
      expiresIn: accessTokenExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      expiresIn: refreshTokenExpiresIn,
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await argon2.hash(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async verifyIdentity(userId: string, dto: VerifyIdentityDto) {
  const user = await this.prisma.user.update({
    where: { id: userId },
    data: {
      isIdentityVerified: true,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
      isFaceVerified: true,
    },
  });

  return {
    message: 'Identity verified successfully',
    user,
    submittedId: {
      idType: dto.idType,
      idNumber: dto.idNumber,
    },
  };
}

async verifyFace(userId: string, dto: VerifyFaceDto) {
  const user = await this.prisma.user.update({
    where: { id: userId },
    data: {
      isFaceVerified: true,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
      isFaceVerified: true,
    },
  });

  return {
    message: 'Face verified successfully',
    user,
    selfieImageUrl: dto.selfieImageUrl,
  };
}

  
}
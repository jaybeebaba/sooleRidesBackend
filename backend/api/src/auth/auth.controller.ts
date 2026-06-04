import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterEmailDto } from './dto/register-email.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AppleAuthDto } from './dto/apple-auth.dto';
import { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPhoneOtpDto } from './dto/request-phone-otp.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';
import { Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-email')
  registerEmail(@Body() dto: RegisterEmailDto) {
    return this.authService.registerEmail(dto);
  }

  @Post('login-email')
  loginEmail(@Body() dto: LoginEmailDto) {
    return this.authService.loginEmail(dto);
  }

  @Post('google')
  google(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto);
  }

  @Post('apple')
  apple(@Body() dto: AppleAuthDto) {
    return this.authService.appleAuth(dto);
  }

  @Post('request-email-verification')
  requestEmailVerification(@Body() dto: RequestEmailVerificationDto) {
    return this.authService.requestEmailVerification(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('request-phone-otp')
  requestPhoneOtp(@Body() dto: RequestPhoneOtpDto) {
    return this.authService.requestPhoneOtp(dto);
  }

  @Post('verify-phone-otp')
  verifyPhoneOtp(@Body() dto: VerifyPhoneOtpDto) {
    return this.authService.verifyPhoneOtp(dto);
  }

  @Get('me')
@UseGuards(JwtAuthGuard)
me(@CurrentUser() user: any) {
  return {
    user,
  };
}

@Post('refresh')
refresh(@Body() dto: RefreshTokenDto) {
  return this.authService.refresh(dto);
}



@Post('logout')
logout(@Body() dto: RefreshTokenDto) {
  return this.authService.logout(dto);
}
}
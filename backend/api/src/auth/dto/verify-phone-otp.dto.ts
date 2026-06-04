import { IsString, Length } from 'class-validator';

export class VerifyPhoneOtpDto {
  @IsString()
  phone!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}
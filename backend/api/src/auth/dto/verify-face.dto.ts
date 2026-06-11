import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyFaceDto {
  @IsString()
  @IsNotEmpty()
  selfieImageUrl!: string;
}
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePassengerProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
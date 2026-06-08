import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  reportedUserId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  details?: string;
}
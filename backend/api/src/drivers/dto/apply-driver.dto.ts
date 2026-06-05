import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class ApplyDriverDto {
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsDriving?: number;
}
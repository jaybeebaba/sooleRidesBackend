import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RideStopDto {
  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsInt()
  @Min(1)
  stopOrder!: number;
}

export class CreateRideDto {
  @IsString()
  @IsNotEmpty()
  vehicleId!: string;

  @IsString()
  @IsNotEmpty()
  origin!: string;

  @IsString()
  @IsNotEmpty()
  destination!: string;

  @IsDateString()
  departureTime!: string;

  @IsOptional()
  @IsDateString()
  estimatedArrivalTime?: string;

  @IsInt()
  @Min(1)
  pricePerSeat!: number;

  @IsInt()
  @Min(1)
  totalSeats!: number;

  @IsOptional()
  @IsBoolean()
  instantBooking?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RideStopDto)
  stops?: RideStopDto[];
}
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  rideId!: string;

  @IsInt()
  @Min(1)
  seatsBooked!: number;
}
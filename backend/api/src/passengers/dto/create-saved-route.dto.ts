import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSavedRouteDto {
  @IsString()
  @IsNotEmpty()
  origin!: string;

  @IsString()
  @IsNotEmpty()
  destination!: string;
}
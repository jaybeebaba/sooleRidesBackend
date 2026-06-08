import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  participantId!: string;

  @IsOptional()
  @IsString()
  rideId?: string;
}
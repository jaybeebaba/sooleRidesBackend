import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId!: string;

  @IsString()
  @MinLength(1)
  content!: string;
}
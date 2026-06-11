import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyIdentityDto {
  @IsString()
  @IsNotEmpty()
  idNumber!: string;

  @IsString()
  @IsNotEmpty()
  idType!: string;
}

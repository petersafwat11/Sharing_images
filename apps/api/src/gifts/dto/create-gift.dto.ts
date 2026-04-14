import { IsString, MaxLength, MinLength, IsOptional } from 'class-validator';

export class CreateGiftDto {
  @IsString()
  @MinLength(1)
  @MaxLength(16)
  portraitShareSlug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  recipientName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

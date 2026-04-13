import { IsString, Length, MinLength } from 'class-validator';
import { SLUG_LENGTH } from '@picflow/shared';

export class ConfirmUploadDto {
  @IsString()
  @MinLength(1)
  key!: string;

  @IsString()
  @Length(SLUG_LENGTH, SLUG_LENGTH)
  slug!: string;
}

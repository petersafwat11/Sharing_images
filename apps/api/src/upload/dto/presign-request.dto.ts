import {
  IsIn,
  IsInt,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  type AllowedMimeType,
} from '@picflow/shared';

export class PresignRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  filename!: string;

  @IsIn(ALLOWED_MIME_TYPES as unknown as readonly string[])
  mimeType!: AllowedMimeType;

  @IsInt()
  @IsPositive()
  @Max(MAX_FILE_SIZE_BYTES)
  size!: number;
}

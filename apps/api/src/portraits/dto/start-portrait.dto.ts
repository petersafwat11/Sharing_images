import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MAX_PORTRAIT_INPUTS, MIN_PORTRAIT_INPUTS } from '@picflow/shared';

export class StartPortraitDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ArrayMinSize(MIN_PORTRAIT_INPUTS)
  @ArrayMaxSize(MAX_PORTRAIT_INPUTS)
  inputKeys!: string[];

  @IsString()
  @IsNotEmpty()
  themeSlug!: string;

  /** Required when not authenticated. Used for "portraits ready" email. */
  @IsOptional()
  @IsEmail()
  email?: string;
}

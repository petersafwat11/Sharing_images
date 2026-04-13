import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import type { SortKey } from '@picflow/shared';

export class ListImagesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  pageSize: number = 24;

  @IsOptional()
  @IsEnum(['newest', 'oldest', 'most-viewed', 'largest'])
  sort: SortKey = 'newest';
}

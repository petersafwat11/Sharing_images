import { IsIn } from 'class-validator';
import { CREDIT_PACKS, type CreditPackId } from '@picflow/shared';

const VALID_IDS = CREDIT_PACKS.map((p) => p.id);

export class CheckoutDto {
  @IsIn(VALID_IDS)
  pack!: CreditPackId;
}

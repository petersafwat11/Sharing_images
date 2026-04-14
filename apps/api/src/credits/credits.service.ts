import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreditHistoryItem {
  id: string;
  delta: number;
  type: string;
  description: string;
  createdAt: string;
}

@Injectable()
export class CreditsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true },
    });
    return user?.creditBalance ?? 0;
  }

  /**
   * Writes the SIGNUP_BONUS ledger entry for a new user.
   * The creditBalance DB default (3) is already applied when the User row
   * is created — this only records the audit CreditTransaction.
   */
  async awardSignupBonus(userId: string): Promise<void> {
    await this.prisma.creditTransaction.create({
      data: {
        userId,
        delta: 3,
        type: 'SIGNUP_BONUS',
        description: '3 free credits on signup',
      },
    });
  }

  /**
   * Credits a user's balance after a successful Stripe payment.
   * Idempotent: the CreditTransaction.stripeId column has a DB-level unique
   * constraint (@@unique([stripeId]) in schema.prisma), so a duplicate Stripe
   * webhook delivery triggers a P2002 unique-constraint violation which we
   * silently swallow — no double-crediting regardless of race conditions.
   */
  async creditPurchase(opts: {
    userId: string;
    delta: number;
    description: string;
    stripeId: string;
  }): Promise<void> {
    try {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: opts.userId },
          data: { creditBalance: { increment: opts.delta } },
          select: { id: true },
        }),
        this.prisma.creditTransaction.create({
          data: {
            userId: opts.userId,
            delta: opts.delta,
            type: 'PURCHASE',
            description: opts.description,
            stripeId: opts.stripeId,
          },
        }),
      ]);
    } catch (err) {
      // P2002 = unique constraint violation — already credited (idempotent)
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return;
      }
      throw err;
    }
  }

  async getHistory(userId: string): Promise<CreditHistoryItem[]> {
    const txs = await this.prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        delta: true,
        type: true,
        description: true,
        createdAt: true,
      },
    });
    return txs.map((tx) => ({
      id: tx.id,
      delta: tx.delta,
      type: tx.type,
      description: tx.description,
      createdAt: tx.createdAt.toISOString(),
    }));
  }
}

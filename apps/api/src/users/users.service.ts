import { Injectable, NotFoundException } from '@nestjs/common';
import type { PublicUser } from '@picflow/shared';
import { PrismaService } from '../prisma/prisma.service';

const PUBLIC_SELECT = {
  id: true,
  email: true,
  username: true,
  avatarUrl: true,
  storageUsed: true,
  createdAt: true,
  creditBalance: true,
} as const;

const AUTH_SELECT = {
  id: true,
  email: true,
  username: true,
  passwordHash: true,
  avatarUrl: true,
} as const;

export interface UserWithHash {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  avatarUrl: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    email: string;
    username: string;
    passwordHash: string;
  }): Promise<PublicUser> {
    const user = await this.prisma.user.create({
      data,
      select: PUBLIC_SELECT,
    });
    return this.toPublic(user);
  }

  async findByEmailWithHash(email: string): Promise<UserWithHash | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: AUTH_SELECT,
    });
  }

  async findByIdPublic(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  async existsByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<boolean> {
    const match = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true },
    });
    return !!match;
  }

  async incrementStorageUsed(userId: string, bytes: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { storageUsed: { increment: bytes } },
      select: { id: true },
    });
  }

  async decrementStorageUsed(userId: string, bytes: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { storageUsed: { decrement: bytes } },
      select: { id: true },
    });
  }

  private toPublic(user: {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    storageUsed: number;
    createdAt: Date;
    creditBalance: number;
  }): PublicUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      storageUsed: user.storageUsed,
      createdAt: user.createdAt.toISOString(),
      creditBalance: user.creditBalance,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logging/logger.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          provider: true,
          isEmailVerified: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          avatarUrl: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        provider: true,
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
        avatarUrl: true,
        loginHistory: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getStats() {
    const [totalUsers, activeUsers, adminUsers, verifiedUsers, todayLogins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { isEmailVerified: true } }),
      this.prisma.loginHistory.count({
        where: {
          action: 'LOGIN_SUCCESS',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      verifiedUsers,
      todayLogins,
    };
  }

  async getLoginHistory(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this.prisma.loginHistory.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loginHistory.count(),
    ]);

    return {
      data: history,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async changeRole(id: string, role: 'ADMIN' | 'USER') {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    this.logger.log(`User ${user.email} role changed to ${role}`, 'UsersService');

    return updated;
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    this.logger.log(
      `User ${user.email} ${updated.isActive ? 'activated' : 'deactivated'}`,
      'UsersService',
    );

    return updated;
  }
}

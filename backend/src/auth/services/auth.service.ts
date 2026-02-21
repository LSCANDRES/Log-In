import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from '../../logging/logger.service';
import { MetricsService } from '../../metrics/metrics.service';
import { EmailService } from './email.service';
import { RegisterDto, LoginDto, GoogleAuthDto } from '../dto';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private logger: LoggerService,
    private emailService: EmailService,
    private metrics: MetricsService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  // ==================== REGISTER ====================
  async register(dto: RegisterDto, ip?: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      emailVerificationToken,
      user.firstName,
    );

    // Log event
    this.logger.logAuthEvent('REGISTER', {
      userId: user.id,
      email: user.email,
      ip,
      provider: 'LOCAL',
      success: true,
    });

    // Prometheus metric
    this.metrics.registerTotal.labels('success', 'LOCAL').inc();

    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        ip,
        provider: 'LOCAL',
      },
    });

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  }

  // ==================== LOGIN ====================
  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      this.logger.logAuthEvent('LOGIN_FAILED', {
        email: dto.email,
        ip,
        provider: 'LOCAL',
        success: false,
        details: 'User not found',
      });

      // Prometheus metric
      this.metrics.loginTotal.labels('failed', 'LOCAL').inc();

      await this.recordFailedLogin(dto.email, ip, userAgent, 'User not found');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      this.logger.logAuthEvent('LOGIN_FAILED', {
        userId: user.id,
        email: user.email,
        ip,
        provider: 'LOCAL',
        success: false,
        details: 'Invalid password',
      });

      // Prometheus metric
      this.metrics.loginTotal.labels('failed', 'LOCAL').inc();

      await this.prisma.loginHistory.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          ip,
          userAgent,
          provider: 'LOCAL',
          details: 'Invalid password',
        },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Update user
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    // Log success
    this.logger.logAuthEvent('LOGIN_SUCCESS', {
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      provider: 'LOCAL',
      success: true,
    });

    // Prometheus metrics
    this.metrics.loginTotal.labels('success', 'LOCAL').inc();
    this.metrics.activeUsersGauge.inc();

    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        ip,
        userAgent,
        provider: 'LOCAL',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  // ==================== GOOGLE AUTH ====================
  async googleAuth(dto: GoogleAuthDto, ip?: string, userAgent?: string) {
    let payload: any;

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      payload = ticket.getPayload();
    } catch (error) {
      this.logger.logAuthEvent('GOOGLE_LOGIN_FAILED', {
        ip,
        provider: 'GOOGLE',
        success: false,
        details: 'Invalid Google token',
      });

      // Prometheus metric
      this.metrics.loginTotal.labels('failed', 'GOOGLE').inc();

      throw new UnauthorizedException('Invalid Google token');
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Google authentication failed');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      // Create new user from Google
      user = await this.prisma.user.create({
        data: {
          email: payload.email,
          firstName: payload.given_name || 'Google',
          lastName: payload.family_name || 'User',
          googleId: payload.sub,
          avatarUrl: payload.picture,
          provider: 'GOOGLE',
          isEmailVerified: true, // Google already verified
          isActive: true,
        },
      });

      this.logger.logAuthEvent('GOOGLE_REGISTER', {
        userId: user.id,
        email: user.email,
        ip,
        provider: 'GOOGLE',
        success: true,
      });

      // Prometheus metric
      this.metrics.registerTotal.labels('success', 'GOOGLE').inc();
    } else if (!user.googleId) {
      // Link Google to existing account
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: payload.sub,
          avatarUrl: user.avatarUrl || payload.picture,
          isEmailVerified: true,
        },
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    this.logger.logAuthEvent('GOOGLE_LOGIN_SUCCESS', {
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      provider: 'GOOGLE',
      success: true,
    });

    // Prometheus metrics
    this.metrics.loginTotal.labels('success', 'GOOGLE').inc();
    this.metrics.activeUsersGauge.inc();

    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        action: 'GOOGLE_LOGIN_SUCCESS',
        ip,
        userAgent,
        provider: 'GOOGLE',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  // ==================== VERIFY EMAIL ====================
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Verification token expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    this.logger.logAuthEvent('EMAIL_VERIFIED', {
      userId: user.id,
      email: user.email,
      success: true,
    });

    // Prometheus metric
    this.metrics.emailVerificationTotal.labels('success').inc();

    return { message: 'Email verified successfully' };
  }

  // ==================== RESEND VERIFICATION ====================
  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a verification link has been sent' };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      emailVerificationToken,
      user.firstName,
    );

    return { message: 'If the email exists, a verification link has been sent' };
  }

  // ==================== REFRESH TOKEN ====================
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshValid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isRefreshValid) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
      },
    });

    this.logger.logAuthEvent('TOKEN_REFRESH', {
      userId: user.id,
      email: user.email,
      success: true,
    });

    // Prometheus metric
    this.metrics.tokenRefreshTotal.labels('success').inc();

    return tokens;
  }

  // ==================== LOGOUT ====================
  async logout(userId: string, ip?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    this.logger.logAuthEvent('LOGOUT', {
      userId,
      email: user?.email,
      ip,
      success: true,
    });

    // Prometheus metrics
    this.metrics.logoutTotal.inc();
    this.metrics.activeUsersGauge.dec();

    await this.prisma.loginHistory.create({
      data: {
        userId,
        action: 'LOGOUT',
        ip,
      },
    });

    return { message: 'Logged out successfully' };
  }

  // ==================== GET PROFILE ====================
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        provider: true,
        avatarUrl: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ==================== HELPERS ====================
  private async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async recordFailedLogin(email: string, ip?: string, userAgent?: string, details?: string) {
    // Try to find user by email for history
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      await this.prisma.loginHistory.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          ip,
          userAgent,
          provider: 'LOCAL',
          details,
        },
      });
    }
  }
}

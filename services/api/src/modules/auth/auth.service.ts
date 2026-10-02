import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/exceptions/error-codes.enum';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existing) {
      throw new ApiException(ErrorCode.USER_ALREADY_EXISTS, 'Email already in use');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        organizationId: registerDto.organizationId,
        profile: { create: {} }
      },
    });

    return this.generateTokens(user.id, user.organizationId);
  }

  async login(loginDto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || user.isDeleted) {
      throw new ApiException(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new ApiException(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
    }

    return this.generateTokens(user.id, user.organizationId, loginDto.deviceName, ip, userAgent);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret' });
      const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      const tokenRecord = await this.prisma.refreshToken.findFirst({
        where: { userId: payload.sub, hash, isRevoked: false },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new ApiException(ErrorCode.AUTH_TOKEN_EXPIRED, 'Refresh token invalid or expired');
      }

      return this.generateTokens(payload.sub, payload.orgId);
    } catch (error) {
      throw new ApiException(ErrorCode.AUTH_TOKEN_INVALID, 'Invalid refresh token');
    }
  }

  async logout(userId: string) {
    // Invalidate all tokens for user on current device (simplified to all for now)
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
    return { success: true };
  }

  private async generateTokens(userId: string, organizationId: string, deviceName?: string, ip?: string, userAgent?: string) {
    const payload = { sub: userId, orgId: organizationId };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'access_secret',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      expiresIn: '7d',
    });

    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        hash,
        device: deviceName,
        ip,
        userAgent,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

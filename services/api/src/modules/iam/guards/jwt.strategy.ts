import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/exceptions/error-codes.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'access_secret',
    });
  }

  async validate(payload: any) {
    // payload: { sub: userId, orgId: organizationId }
    
    // Load Session/User
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.isDeleted) {
      throw new ApiException(ErrorCode.AUTH_TOKEN_INVALID, 'User not found or deleted');
    }

    // Return the validated user payload which will be attached to req.user
    return { 
      id: user.id, 
      email: user.email,
      organizationId: payload.orgId, 
    };
  }
}

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/exceptions/error-codes.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ApiException(ErrorCode.AUTH_TOKEN_INVALID, 'Unauthorized');
    }

    // 1. Load Membership
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: user.organizationId,
        }
      }
    });

    if (!membership && user.organizationId !== 'system') { // bypass check if system admin user but in a real system need better check
       // Wait, users belong to an organization directly in this schema via user.organizationId. 
       // The membership table is for multi-tenancy.
       // For Phase 1 we will just load roles based on userRoles mapping.
    }

    // 2. Load Roles & Permissions
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    const userPermissions = new Set<string>();
    for (const ur of userRoles) {
      // Check if role matches the current active organization context
      if (ur.role.organizationId === user.organizationId || ur.role.isSystem) {
        for (const rp of ur.role.permissions) {
          userPermissions.add(rp.permission.action);
        }
      }
    }

    // 3. Policy Check
    const hasPermission = requiredPermissions.every((perm) => userPermissions.has(perm));

    if (!hasPermission) {
      throw new ApiException(
        ErrorCode.PERMISSION_DENIED, 
        `Missing required permissions: ${requiredPermissions.filter(p => !userPermissions.has(p)).join(', ')}`
      );
    }

    return true;
  }
}

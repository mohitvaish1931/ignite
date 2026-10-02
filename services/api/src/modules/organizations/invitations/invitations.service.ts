import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/exceptions/error-codes.enum';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvitation(organizationId: string, createDto: CreateInvitationDto, inviterId?: string) {
    const existingMember = await this.prisma.user.findUnique({
      where: { email: createDto.email },
      include: {
        memberships: { where: { organizationId } }
      }
    });

    if (existingMember && existingMember.memberships.length > 0) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, 'User is already a member of this organization');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Delete existing pending invitation for same email/org
    const existingInvites = await this.prisma.organizationInvitation.findMany({
      where: { email: createDto.email, organizationId, status: 'PENDING' }
    });
    
    if (existingInvites.length > 0) {
      await this.prisma.organizationInvitation.deleteMany({
        where: { id: { in: existingInvites.map(i => i.id) } }
      });
    }

    const invitation = await this.prisma.organizationInvitation.create({
      data: {
        email: createDto.email,
        organizationId,
        token,
        expiresAt,
        invitedBy: inviterId || 'system',
        roleId: createDto.roleId || '',
      }
    });

    return invitation;
  }

  async acceptInvitation(acceptDto: AcceptInvitationDto, userId: string) {
    const invitation = await this.prisma.organizationInvitation.findUnique({
      where: { token: acceptDto.token },
    });

    if (!invitation) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, 'Invalid invitation token');
    }

    if (invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, 'Invitation expired or already used');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== invitation.email) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, 'This invitation was sent to a different email address');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId,
        }
      });

      if (invitation.roleId && invitation.roleId !== '') {
        await tx.userRole.create({
          data: {
            userId,
            roleId: invitation.roleId,
          }
        });
      }

      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' }
      });

      return { success: true, organizationId: invitation.organizationId };
    });
  }

  async listInvitations(organizationId: string) {
    return this.prisma.organizationInvitation.findMany({
      where: { organizationId },
    });
  }
}

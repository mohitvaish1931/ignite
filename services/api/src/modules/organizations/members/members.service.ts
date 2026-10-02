import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/exceptions/error-codes.enum';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async addMember(organizationId: string, addMemberDto: AddMemberDto) {
    const existing = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: addMemberDto.userId,
          organizationId
        }
      }
    });

    if (existing) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, 'User is already a member of this organization');
    }

    return this.prisma.organizationMember.create({
      data: {
        organizationId,
        userId: addMemberDto.userId,
      }
    });
  }

  async removeMember(organizationId: string, userId: string) {
    return this.prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      }
    });
  }

  async listMembers(organizationId: string) {
    return this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } }
    });
  }
}

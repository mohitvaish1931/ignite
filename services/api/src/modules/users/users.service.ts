import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/exceptions/error-codes.enum';
import * as crypto from 'crypto'; // For temp hashing if needed

@Injectable()
export class UsersService extends BaseCrudService<User> {
  constructor(protected readonly prismaService: PrismaService) {
    super(prismaService, {
      modelName: 'user',
      searchFields: ['email', 'firstName', 'lastName'],
      defaultSort: 'createdAt',
    });
  }

  async create(createDto: CreateUserDto, currentUserId?: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({
      where: { email: createDto.email },
    });

    if (existing) {
      throw new ApiException(ErrorCode.USER_ALREADY_EXISTS, 'User with this email already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          ...createDto,
          createdBy: currentUserId,
          profile: {
            create: {}
          }
        },
      });

      // 2. Log Audit
      await this.logAudit(
        createDto.organizationId,
        'USER_CREATED',
        'User',
        user.id,
        currentUserId,
        null,
        user,
      );

      return user;
    });
  }

  async update(id: string, updateDto: UpdateUserDto, currentUserId?: string): Promise<User> {
    const existing = await this.findOne(id);

    if (updateDto.email && updateDto.email !== existing.email) {
      const emailCheck = await this.prisma.user.findUnique({
        where: { email: updateDto.email },
      });
      if (emailCheck) {
        throw new ApiException(ErrorCode.USER_ALREADY_EXISTS, 'Email already taken');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateDto,
        updatedBy: currentUserId,
        version: { increment: 1 },
      },
    });

    await this.logAudit(
      existing.organizationId,
      'USER_UPDATED',
      'User',
      id,
      currentUserId,
      existing,
      updated,
    );

    return updated;
  }
}

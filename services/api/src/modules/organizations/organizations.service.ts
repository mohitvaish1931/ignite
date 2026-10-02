import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient, Organization } from '@prisma/client';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/exceptions/error-codes.enum';

@Injectable()
export class OrganizationsService extends BaseCrudService<Organization> {
  constructor(protected readonly prismaService: PrismaService) {
    super(prismaService, {
      modelName: 'organization',
      searchFields: ['name', 'slug', 'domain'],
      defaultSort: 'createdAt',
    });
  }

  async create(createDto: CreateOrganizationDto, userId?: string): Promise<Organization> {
    // Check if slug exists
    const existing = await this.prisma.organization.findUnique({
      where: { slug: createDto.slug },
    });

    if (existing) {
      throw new ApiException(ErrorCode.ORG_ALREADY_EXISTS, 'Organization with this slug already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          ...createDto,
          createdBy: userId,
          settings: {
            create: {
              settings: {},
            },
          },
        },
      });

      // 2. Log Audit
      await this.logAudit(
        org.id,
        'ORG_CREATED',
        'Organization',
        org.id,
        userId,
        null,
        org,
      );

      return org;
    });
  }

  async update(id: string, updateDto: UpdateOrganizationDto, userId?: string): Promise<Organization> {
    const existing = await this.findOne(id);

    if (updateDto.slug && updateDto.slug !== existing.slug) {
      const slugCheck = await this.prisma.organization.findUnique({
        where: { slug: updateDto.slug },
      });
      if (slugCheck) {
        throw new ApiException(ErrorCode.ORG_ALREADY_EXISTS, 'Slug already taken');
      }
    }

    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        ...updateDto,
        updatedBy: userId,
        version: { increment: 1 },
      },
    });

    await this.logAudit(
      id,
      'ORG_UPDATED',
      'Organization',
      id,
      userId,
      existing,
      updated,
    );

    return updated;
  }
}

import { PrismaClient } from '@prisma/client';
import { PaginationDto, PaginatedResult } from '../dtos/pagination.dto';
import { ApiException } from '../exceptions/api.exception';
import { ErrorCode } from '../exceptions/error-codes.enum';

export interface BaseCrudConfig {
  modelName: keyof PrismaClient;
  searchFields?: string[];
  defaultSort?: string;
}

export class BaseCrudService<T> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly config: BaseCrudConfig,
  ) {}

  /**
   * Internal helper to dynamically access the Prisma model delegate
   */
  protected get delegate(): any {
    return this.prisma[this.config.modelName];
  }

  /**
   * Find Many with Pagination, Sorting, and Filtering
   */
  async findMany(
    paginationDto: PaginationDto,
    where: any = {},
    include?: any,
  ): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, search, sort, order } = paginationDto;
    const skip = (page - 1) * limit;

    // Default to only not-deleted records if the model supports it
    const activeWhere = { ...where, isDeleted: false };

    // Search logic
    if (search && this.config.searchFields && this.config.searchFields.length > 0) {
      activeWhere.OR = this.config.searchFields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    const orderBy: Record<string, any> = {};
    if (sort) {
      orderBy[sort] = order || 'desc';
    } else if (this.config.defaultSort) {
      orderBy[this.config.defaultSort] = 'desc';
    } else {
      orderBy['createdAt'] = 'desc';
    }

    const [data, total] = await Promise.all([
      this.delegate.findMany({
        where: activeWhere,
        skip,
        take: limit,
        orderBy,
        include,
      }),
      this.delegate.count({ where: activeWhere }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find One by ID
   */
  async findOne(id: string, include?: any): Promise<T> {
    const record = await this.delegate.findFirst({
      where: { id, isDeleted: false },
      include,
    });

    if (!record) {
      throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, `${String(this.config.modelName)} not found`);
    }

    return record;
  }

  /**
   * Soft Delete with Audit
   */
  async softDelete(id: string, deletedBy?: string): Promise<T> {
    // Check existence first
    await this.findOne(id);

    return this.delegate.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  /**
   * Hard Delete
   */
  async hardDelete(id: string): Promise<T> {
    return this.delegate.delete({
      where: { id },
    });
  }

  /**
   * Audit Logger Hook
   */
  async logAudit(
    organizationId: string,
    action: string,
    resource: string,
    resourceId: string,
    actorId?: string,
    before?: any,
    after?: any,
    ip?: string,
    userAgent?: string,
    requestId?: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorId,
        action,
        resource,
        resourceId,
        before: before ? (before as any) : undefined,
        after: after ? (after as any) : undefined,
        ip,
        userAgent,
        requestId,
      },
    });
  }
}

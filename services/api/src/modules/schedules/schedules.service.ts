import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { Schedule } from '@prisma/client';
import { VenuesService } from '../venues/venues.service';

@Injectable()
export class SchedulesService extends BaseCrudService<Schedule> {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    protected readonly prisma: PrismaService,
    private readonly venuesService: VenuesService
  ) {
    super(prisma, { modelName: 'schedule', defaultSort: 'createdAt' });
  }

  async create(data: any) {
    return this.prisma.schedule.create({ data });
  }

  async addSession(scheduleId: string, data: any) {
    if (data.venueId) {
      await this.venuesService.checkConflict(
        data.venueId,
        new Date(data.startAt),
        new Date(data.endAt)
      );
    }

    return this.prisma.session.create({
      data: {
        ...data,
        scheduleId
      }
    });
  }
}

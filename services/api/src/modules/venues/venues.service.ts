import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { Venue } from '@prisma/client';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/exceptions/error-codes.enum';

@Injectable()
export class VenuesService extends BaseCrudService<Venue> {
  private readonly logger = new Logger(VenuesService.name);

  constructor(protected readonly prisma: PrismaService) {
    super(prisma, { modelName: 'venue', defaultSort: 'name' });
  }

  /**
   * Checks if a venue is available for a given time slot.
   * Throws ApiException if there is an overlapping session.
   */
  async checkConflict(venueId: string, startAt: Date, endAt: Date, excludeSessionId?: string) {
    const overlappingSession = await this.prisma.session.findFirst({
      where: {
        venueId,
        ...(excludeSessionId ? { id: { not: excludeSessionId } } : {}),
        OR: [
          {
            startAt: { lt: endAt },
            endAt: { gt: startAt }
          }
        ]
      },
      include: {
        schedule: {
          include: {
            event: true
          }
        }
      }
    });

    if (overlappingSession) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        `Venue conflict detected: Already booked for session "${overlappingSession.title}" in event "${overlappingSession.schedule.event.name}" from ${overlappingSession.startAt.toISOString()} to ${overlappingSession.endAt.toISOString()}`
      );
    }
  }
}

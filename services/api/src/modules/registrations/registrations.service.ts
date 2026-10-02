import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { EventRegistration } from '@prisma/client';
import { EventDomainService } from '../events/event-domain/event-domain.service';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/exceptions/error-codes.enum';

@Injectable()
export class RegistrationsService extends BaseCrudService<EventRegistration> {
  private readonly logger = new Logger(RegistrationsService.name);

  constructor(
    protected readonly prisma: PrismaService,
    private readonly eventDomainService: EventDomainService
  ) {
    super(prisma, { modelName: 'eventRegistration', defaultSort: 'createdAt' });
  }

  async registerUser(eventId: string, userId: string, answers: any[]) {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUniqueOrThrow({ where: { id: eventId } });

      this.eventDomainService.validateRegistrationState(event);
      this.eventDomainService.validateRegistrationWindow(event);
      
      const currentCount = await tx.eventRegistration.count({ where: { eventId } });
      this.eventDomainService.validateCapacity(event, currentCount);

      // Create Registration
      const registration = await tx.eventRegistration.create({
        data: {
          eventId,
          userId,
          status: 'PENDING',
          answers: {
            create: answers.map(a => ({
              fieldId: a.fieldId,
              value: a.value
            }))
          }
        }
      });

      await this.eventDomainService.createTimelineEntry(
        tx,
        eventId,
        'USER_REGISTERED',
        `User registered for event`,
        userId,
        { registrationId: registration.id }
      );

      return registration;
    });
  }
}

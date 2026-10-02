import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { EventDomainService } from './event-domain/event-domain.service';
import { CreateEventDto, UpdateEventDto, ChangeStateDto } from './dto/event.dto';
import { EventState, Event } from '@prisma/client';
import { EVENT_BUS } from '../../common/event-bus/event-bus.interface';
import type { IEventBus } from '../../common/event-bus/event-bus.interface';
import { Inject } from '@nestjs/common';

@Injectable()
export class EventsService extends BaseCrudService<Event> {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    protected readonly prisma: PrismaService,
    private readonly eventDomainService: EventDomainService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {
    super(prisma, { modelName: 'event', defaultSort: 'createdAt' });
  }

  async createEvent(createDto: CreateEventDto, actorId: string, organizationId: string) {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          ...createDto,
          organizationId,
          createdBy: actorId,
          state: 'DRAFT',
          settings: {
            create: {}
          }
        },
      });

      await this.eventDomainService.createTimelineEntry(
        tx,
        event.id,
        'EVENT_CREATED',
        'Event was created in Draft state',
        actorId
      );

      return event;
    });
  }

  async changeState(id: string, changeStateDto: ChangeStateDto, actorId: string, organizationId: string) {
    const event = await this.prisma.event.findFirstOrThrow({
      where: { id, organizationId }
    });

    this.eventDomainService.validateTransition(event.state, changeStateDto.newState);

    return this.prisma.$transaction(async (tx) => {
      const updatedEvent = await tx.event.update({
        where: { id },
        data: { state: changeStateDto.newState }
      });

      await this.eventDomainService.createTimelineEntry(
        tx,
        event.id,
        'STATE_CHANGED',
        `Event state changed from ${event.state} to ${changeStateDto.newState}`,
        actorId,
        { previousState: event.state, newState: changeStateDto.newState }
      );

      // Create Snapshot (Versioning)
      await tx.eventVersion.create({
        data: {
          eventId: event.id,
          version: updatedEvent.version + 1,
          snapshot: updatedEvent as any,
          createdBy: actorId
        }
      });
      const finalizedEvent = await tx.event.update({ where: { id }, data: { version: updatedEvent.version + 1 } });

      this.eventBus.emit(`event.${changeStateDto.newState.toLowerCase()}`, finalizedEvent);

      return finalizedEvent;
    });
  }
}

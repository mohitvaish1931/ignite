import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventState, Event } from '@prisma/client';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/exceptions/error-codes.enum';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';
import type { IEventBus } from '../../../common/event-bus/event-bus.interface';

const STATE_TRANSITIONS: Record<EventState, EventState[]> = {
  DRAFT: ['REVIEW'],
  REVIEW: ['PUBLISHED', 'DRAFT'],
  PUBLISHED: ['REGISTRATION_OPEN', 'ARCHIVED'],
  REGISTRATION_OPEN: ['REGISTRATION_CLOSED', 'ARCHIVED'],
  REGISTRATION_CLOSED: ['LIVE', 'ARCHIVED'],
  LIVE: ['COMPLETED', 'ARCHIVED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: [],
};

@Injectable()
export class EventDomainService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  /**
   * Validates if a state transition is allowed
   */
  validateTransition(currentState: EventState, nextState: EventState) {
    const allowedTransitions = STATE_TRANSITIONS[currentState] || [];
    if (!allowedTransitions.includes(nextState)) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        `Invalid state transition from ${currentState} to ${nextState}`
      );
    }
  }

  /**
   * Creates a timeline entry for an event
   */
  async createTimelineEntry(tx: any, eventId: string, action: string, message: string, actorId?: string, metadata: any = {}) {
    await tx.eventTimeline.create({
      data: {
        eventId,
        actorId,
        action,
        message,
        metadata,
      }
    });
  }

  /**
   * Validates capacity limit during registration
   */
  validateCapacity(event: Event, currentRegistrationsCount: number) {
    if (event.capacity !== null && currentRegistrationsCount >= event.capacity) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, 'Event capacity reached');
    }
  }

  /**
   * Validates registration window constraints
   */
  validateRegistrationWindow(event: Event) {
    const now = new Date();
    if (event.registrationStartAt && now < event.registrationStartAt) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, 'Registration has not started yet');
    }
    if (event.registrationEndAt && now > event.registrationEndAt) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, 'Registration has closed');
    }
  }

  /**
   * Validates if the event is strictly in REGISTRATION_OPEN state
   */
  validateRegistrationState(event: Event) {
    if (event.state !== 'REGISTRATION_OPEN') {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, 'Registration is currently closed for this event');
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { EventDomainService } from './event-domain.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';
import { ApiException } from '../../../common/exceptions/api.exception';

describe('EventDomainService', () => {
  let service: EventDomainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventDomainService,
        { provide: PrismaService, useValue: {} },
        { provide: EVENT_BUS, useValue: { emit: jest.fn(), emitAsync: jest.fn() } }
      ],
    }).compile();

    service = module.get<EventDomainService>(EventDomainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTransition', () => {
    it('should allow DRAFT -> REVIEW', () => {
      expect(() => service.validateTransition('DRAFT', 'REVIEW')).not.toThrow();
    });

    it('should NOT allow DRAFT -> LIVE', () => {
      expect(() => service.validateTransition('DRAFT', 'LIVE')).toThrow(ApiException);
    });

    it('should NOT allow COMPLETED -> REGISTRATION_OPEN', () => {
      expect(() => service.validateTransition('COMPLETED', 'REGISTRATION_OPEN')).toThrow(ApiException);
    });

    it('should NOT allow ARCHIVED -> PUBLISHED', () => {
      expect(() => service.validateTransition('ARCHIVED', 'PUBLISHED')).toThrow(ApiException);
    });

    it('should NOT allow REGISTRATION_CLOSED -> DRAFT', () => {
      expect(() => service.validateTransition('REGISTRATION_CLOSED', 'DRAFT')).toThrow(ApiException);
    });
  });

  describe('validateCapacity', () => {
    it('should allow if capacity is null', () => {
      expect(() => service.validateCapacity({ capacity: null } as any, 1000)).not.toThrow();
    });

    it('should allow if current registrations < capacity', () => {
      expect(() => service.validateCapacity({ capacity: 100 } as any, 99)).not.toThrow();
    });

    it('should throw if current registrations >= capacity', () => {
      expect(() => service.validateCapacity({ capacity: 100 } as any, 100)).toThrow(ApiException);
      expect(() => service.validateCapacity({ capacity: 100 } as any, 101)).toThrow(ApiException);
    });
  });

  describe('validateRegistrationWindow', () => {
    const now = new Date();

    it('should allow if no dates set', () => {
      expect(() => service.validateRegistrationWindow({} as any)).not.toThrow();
    });

    it('should throw if before start time', () => {
      const future = new Date(now.getTime() + 10000);
      expect(() => service.validateRegistrationWindow({ registrationStartAt: future } as any)).toThrow(ApiException);
    });

    it('should throw if after end time', () => {
      const past = new Date(now.getTime() - 10000);
      expect(() => service.validateRegistrationWindow({ registrationEndAt: past } as any)).toThrow(ApiException);
    });

    it('should allow if within window', () => {
      const past = new Date(now.getTime() - 10000);
      const future = new Date(now.getTime() + 10000);
      expect(() => service.validateRegistrationWindow({
        registrationStartAt: past,
        registrationEndAt: future
      } as any)).not.toThrow();
    });
  });
});

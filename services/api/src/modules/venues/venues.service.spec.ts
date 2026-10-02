import { Test, TestingModule } from '@nestjs/testing';
import { VenuesService } from './venues.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiException } from '../../common/exceptions/api.exception';

const mockPrisma = {
  session: {
    findFirst: jest.fn(),
  },
  venue: {} // BaseCrudService requires this model to exist
};

describe('VenuesService', () => {
  let service: VenuesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VenuesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VenuesService>(VenuesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkConflict', () => {
    it('should throw ApiException (409) when a session overlaps', async () => {
      // Mock an existing session that overlaps
      (prisma.session.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'session_1',
        title: 'Session A',
        startAt: new Date('2026-08-01T09:00:00Z'),
        endAt: new Date('2026-08-01T11:00:00Z'),
        schedule: { event: { name: 'Hackathon' } }
      });

      const reqStart = new Date('2026-08-01T10:00:00Z');
      const reqEnd = new Date('2026-08-01T12:00:00Z');

      await expect(service.checkConflict('venue_1', reqStart, reqEnd)).rejects.toThrow(ApiException);
    });

    it('should succeed when no session overlaps', async () => {
      // Mock no existing overlapping sessions
      (prisma.session.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const reqStart = new Date('2026-08-01T11:01:00Z');
      const reqEnd = new Date('2026-08-01T12:00:00Z');

      await expect(service.checkConflict('venue_1', reqStart, reqEnd)).resolves.not.toThrow();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ScoringDomainService } from './scoring-domain.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';

const mockPrisma = {
  judgeAssignment: { findUnique: jest.fn(), update: jest.fn() },
  scorecardCriterion: { findUnique: jest.fn() },
  judgeScore: { upsert: jest.fn() },
  $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma))
};
const mockEventBus = { emit: jest.fn() };

describe('ScoringDomainService', () => {
  let service: ScoringDomainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringDomainService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EVENT_BUS, useValue: mockEventBus }
      ],
    }).compile();

    service = module.get<ScoringDomainService>(ScoringDomainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should prevent scoring if not assigned', async () => {
    mockPrisma.judgeAssignment.findUnique.mockResolvedValueOnce({ id: 'assign_1', judgeId: 'judge_2' });
    await expect(service.submitScore('assign_1', 'judge_1', [])).rejects.toThrow('Not assigned to you');
  });

  it('should prevent scoring out of bounds', async () => {
    mockPrisma.judgeAssignment.findUnique.mockResolvedValueOnce({ id: 'assign_1', judgeId: 'judge_1', status: 'ASSIGNED' });
    mockPrisma.scorecardCriterion.findUnique.mockResolvedValueOnce({ id: 'crit_1', maxScore: 10 });
    
    await expect(service.submitScore('assign_1', 'judge_1', [{ criterionId: 'crit_1', score: 15 }]))
      .rejects.toThrow('Score out of bounds');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardService } from './leaderboard.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';

const mockPrisma = {
  submission: { findMany: jest.fn() },
  leaderboard: { deleteMany: jest.fn(), createMany: jest.fn() },
  $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma))
};
const mockEventBus = { emit: jest.fn() };

describe('LeaderboardService', () => {
  let service: LeaderboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EVENT_BUS, useValue: mockEventBus }
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate weighted average and rank correctly', async () => {
    mockPrisma.submission.findMany.mockResolvedValueOnce([
      {
        teamId: 'team_a', team: { eventId: 'evt_1', trackId: 'trk_1' }, lockedAt: new Date(1000),
        judgeAssignments: [
          { scores: [{ score: 10, criterion: { weight: 0.5 } }] },
          { scores: [{ score: 8, criterion: { weight: 0.5 } }] } // Total weighted = 5 + 4 = 9, avg = 4.5
        ]
      },
      {
        teamId: 'team_b', team: { eventId: 'evt_1', trackId: 'trk_1' }, lockedAt: new Date(2000),
        judgeAssignments: [
          { scores: [{ score: 10, criterion: { weight: 1.0 } }] } // Total weighted = 10, avg = 10
        ]
      }
    ]);

    const result = await service.recalculateLeaderboard('evt_1', 'trk_1');
    expect(result.length).toBe(2);
    expect(result[0].teamId).toBe('team_b'); // Highest score first
    expect(result[1].teamId).toBe('team_a');
  });

  it('should apply tie breaker logic (earliest submission wins)', async () => {
    mockPrisma.submission.findMany.mockResolvedValueOnce([
      {
        teamId: 'team_late', team: { eventId: 'evt_1', trackId: 'trk_1' }, lockedAt: new Date(5000),
        judgeAssignments: [{ scores: [{ score: 10, criterion: { weight: 1.0 } }] }] // avg 10
      },
      {
        teamId: 'team_early', team: { eventId: 'evt_1', trackId: 'trk_1' }, lockedAt: new Date(1000),
        judgeAssignments: [{ scores: [{ score: 10, criterion: { weight: 1.0 } }] }] // avg 10
      }
    ]);

    const result = await service.recalculateLeaderboard('evt_1', 'trk_1');
    expect(result[0].teamId).toBe('team_early'); // Exact same score, but early wins
  });
});

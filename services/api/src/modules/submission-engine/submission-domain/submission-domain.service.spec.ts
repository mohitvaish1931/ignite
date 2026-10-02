import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionDomainService } from './submission-domain.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';

const mockPrisma = {
  team: { findUnique: jest.fn() },
  submission: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
  submissionVersion: { count: jest.fn(), create: jest.fn() },
  $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma))
};
const mockEventBus = { emit: jest.fn() };

describe('SubmissionDomainService', () => {
  let service: SubmissionDomainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionDomainService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EVENT_BUS, useValue: mockEventBus }
      ],
    }).compile();

    service = module.get<SubmissionDomainService>(SubmissionDomainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should prevent updating a locked submission', async () => {
    mockPrisma.team.findUnique.mockResolvedValueOnce({
      id: 'team_1',
      members: [{ userId: 'user_1' }],
      submissions: [{ id: 'sub_1', status: 'LOCKED' }]
    });

    await expect(service.createOrUpdateSubmission('team_1', 'user_1', undefined, []))
      .rejects.toThrow('Submission is locked');
  });

  it('should increment version correctly on update', async () => {
    mockPrisma.team.findUnique.mockResolvedValueOnce({
      id: 'team_1',
      members: [{ userId: 'user_1' }],
      submissions: [{ id: 'sub_1', status: 'SUBMITTED' }]
    });
    mockPrisma.submissionVersion.count.mockResolvedValueOnce(2);
    mockPrisma.submissionVersion.create.mockResolvedValueOnce({ versionNumber: 3 });

    const result = await service.createOrUpdateSubmission('team_1', 'user_1', undefined, [{ type: 'REPOSITORY', url: 'github' }]);
    
    expect(result.versionNumber).toBe(3);
    expect(mockPrisma.submissionVersion.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ 
        versionNumber: 3, 
        assets: { create: [{ type: 'REPOSITORY', url: 'github' }] } 
      })
    }));
  });

  it('should prevent non-leaders from finalizing', async () => {
    mockPrisma.submission.findUnique.mockResolvedValueOnce({
      id: 'sub_1',
      team: { members: [{ userId: 'user_1', role: 'MEMBER' }] }
    });

    await expect(service.finalizeSubmission('sub_1', 'user_1')).rejects.toThrow('Only leader can finalize');
  });
});

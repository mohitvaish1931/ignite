import { Test, TestingModule } from '@nestjs/testing';
import { TeamDomainService } from './team-domain.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';

const mockPrisma = {
  teamMember: { findFirst: jest.fn(), create: jest.fn() },
  team: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  teamInvite: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma))
};
const mockEventBus = { emit: jest.fn() };

describe('TeamDomainService', () => {
  let service: TeamDomainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamDomainService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EVENT_BUS, useValue: mockEventBus }
      ],
    }).compile();

    service = module.get<TeamDomainService>(TeamDomainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should enforce 1 Team Per Event constraint', async () => {
    mockPrisma.teamMember.findFirst.mockResolvedValueOnce({ id: 'mem1' });
    await expect(service.createTeam('event_1', 'user_1', 'Team A')).rejects.toThrow('User is already part of a team for this event.');
  });

  it('should prevent non-leaders from inviting', async () => {
    mockPrisma.team.findUnique.mockResolvedValueOnce({
      id: 'team_1',
      members: [{ userId: 'user_1', role: 'MEMBER' }]
    });
    await expect(service.inviteMember('team_1', 'test@test.com', 'user_1')).rejects.toThrow('Only leader can invite');
  });

  it('should enforce maxTeamSize when accepting invite', async () => {
    mockPrisma.teamInvite.findUnique.mockResolvedValueOnce({
      id: 'inv_1',
      status: 'PENDING',
      team: {
        eventId: 'event_1',
        track: { maxTeamSize: 2 },
        members: [{ id: 'm1' }, { id: 'm2' }]
      }
    });
    mockPrisma.teamMember.findFirst.mockResolvedValueOnce(null);

    await expect(service.acceptInvite('inv_1', 'user_3')).rejects.toThrow('Team is full');
  });
});

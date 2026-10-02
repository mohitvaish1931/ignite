import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';
import type { IEventBus } from '../../../common/event-bus/event-bus.interface';
import { TeamStatus, TeamMemberRole, InviteStatus, Team } from '@prisma/client';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/exceptions/error-codes.enum';

@Injectable()
export class TeamDomainService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  async createTeam(eventId: string, leaderId: string, name: string, trackId?: string): Promise<Team> {
    // Constraint: 1 Team Per Event
    const existingMembership = await this.prisma.teamMember.findFirst({
      where: {
        userId: leaderId,
        team: { eventId }
      }
    });

    if (existingMembership) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, 'User is already part of a team for this event.', 400);
    }

    return await this.prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          eventId,
          name,
          trackId,
          status: 'DRAFT',
          members: {
            create: {
              userId: leaderId,
              role: 'LEADER'
            }
          }
        }
      });
      this.eventBus.emit('team.created', { teamId: team.id, eventId });
      return team;
    });
  }

  async inviteMember(teamId: string, email: string, inviterId: string): Promise<any> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId }, include: { event: true, members: true } });
    if (!team) throw new ApiException(ErrorCode.NOT_FOUND, 'Team not found', 404);

    const leader = team.members.find(m => m.role === 'LEADER');
    if (leader?.userId !== inviterId) throw new ApiException(ErrorCode.UNAUTHORIZED, 'Only leader can invite', 403);

    // Track constraints could be checked here
    const invite = await this.prisma.teamInvite.create({
      data: {
        teamId,
        email,
        status: 'PENDING',
        invitedBy: inviterId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    this.eventBus.emit('team.member_invited', { teamId, email });
    return invite;
  }

  async acceptInvite(inviteId: string, userId: string): Promise<any> {
    const invite = await this.prisma.teamInvite.findUnique({ where: { id: inviteId }, include: { team: { include: { track: true, members: true } } } });
    if (!invite || invite.status !== 'PENDING') throw new ApiException(ErrorCode.VALIDATION_ERROR, 'Invalid or expired invite', 400);

    const team = invite.team;
    
    // Check Event 1-team rule
    const existingMembership = await this.prisma.teamMember.findFirst({
      where: { userId, team: { eventId: team.eventId } }
    });
    if (existingMembership) throw new ApiException(ErrorCode.VALIDATION_ERROR, 'Already in a team for this event', 400);

    // Max Size Check
    const maxTeamSize = team.track?.maxTeamSize || 4; // Default fallback
    if (team.members.length >= maxTeamSize) throw new ApiException(ErrorCode.VALIDATION_ERROR, 'Team is full', 400);

    return await this.prisma.$transaction(async (tx) => {
      await tx.teamInvite.update({ where: { id: inviteId }, data: { status: 'ACCEPTED' } });
      const member = await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId,
          role: 'MEMBER'
        }
      });
      this.eventBus.emit('team.member_joined', { teamId: team.id, userId });
      return member;
    });
  }

  async transitionStatus(teamId: string, requesterId: string, status: TeamStatus): Promise<Team> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId }, include: { members: true, track: true } });
    if (!team) throw new ApiException(ErrorCode.NOT_FOUND, 'Team not found', 404);

    const isLeader = team.members.some(m => m.userId === requesterId && m.role === 'LEADER');
    if (!isLeader) throw new ApiException(ErrorCode.UNAUTHORIZED, 'Only leader can transition status', 403);

    if (status === 'READY' || status === 'SUBMITTED') {
      const minSize = team.track?.minTeamSize || 1;
      if (team.members.length < minSize) throw new ApiException(ErrorCode.VALIDATION_ERROR, `Team requires minimum ${minSize} members`, 400);
    }

    const updated = await this.prisma.team.update({
      where: { id: teamId },
      data: { status }
    });

    this.eventBus.emit('team.status_changed', { teamId, status });
    return updated;
  }
}

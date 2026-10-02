import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';
import type { IEventBus } from '../../../common/event-bus/event-bus.interface';
import { SubmissionStatus, Submission, SubmissionVersion } from '@prisma/client';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/exceptions/error-codes.enum';

@Injectable()
export class SubmissionDomainService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  async createOrUpdateSubmission(
    teamId: string, 
    userId: string, 
    problemStatementId: string | undefined, 
    assets: { type: 'REPOSITORY' | 'DEMO' | 'DOCUMENT' | 'IMAGE' | 'VIDEO', url: string }[]
  ): Promise<SubmissionVersion> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId }, include: { members: true, submissions: true } });
    if (!team) throw new ApiException(ErrorCode.NOT_FOUND, 'Team not found', 404);

    const isMember = team.members.some(m => m.userId === userId);
    if (!isMember) throw new ApiException(ErrorCode.UNAUTHORIZED, 'Not a team member', 403);

    let submission = team.submissions[0];

    return await this.prisma.$transaction(async (tx) => {
      if (!submission) {
        submission = await tx.submission.create({
          data: {
            teamId,
            problemStatementId,
            status: 'DRAFT'
          }
        });
      } else if (submission.status === 'LOCKED' || submission.status === 'UNDER_REVIEW') {
        throw new ApiException(ErrorCode.VALIDATION_ERROR, 'Submission is locked', 400);
      }

      const versionCount = await tx.submissionVersion.count({ where: { submissionId: submission.id }});

      const newVersion = await tx.submissionVersion.create({
        data: {
          submissionId: submission.id,
          versionNumber: versionCount + 1,
          assets: {
            create: assets.map(a => ({ type: a.type, url: a.url }))
          }
        }
      });

      if (submission.status === 'DRAFT') {
        await tx.submission.update({ where: { id: submission.id }, data: { status: 'SUBMITTED' } });
      }

      this.eventBus.emit('submission.updated', { submissionId: submission.id, version: newVersion.versionNumber });
      return newVersion;
    });
  }

  async finalizeSubmission(submissionId: string, userId: string): Promise<Submission> {
    const submission = await this.prisma.submission.findUnique({ where: { id: submissionId }, include: { team: { include: { members: true } } } });
    if (!submission) throw new ApiException(ErrorCode.NOT_FOUND, 'Submission not found', 404);

    const isLeader = submission.team.members.some(m => m.userId === userId && m.role === 'LEADER');
    if (!isLeader) throw new ApiException(ErrorCode.UNAUTHORIZED, 'Only leader can finalize', 403);

    const updated = await this.prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'LOCKED', lockedAt: new Date() }
    });

    this.eventBus.emit('submission.finalized', { submissionId });
    return updated;
  }
}

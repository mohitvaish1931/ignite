import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';
import type { IEventBus } from '../../../common/event-bus/event-bus.interface';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/exceptions/error-codes.enum';

@Injectable()
export class ScoringDomainService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  async submitScore(assignmentId: string, judgeId: string, scores: { criterionId: string, score: number, remarks?: string }[]): Promise<any> {
    const assignment = await this.prisma.judgeAssignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new ApiException(ErrorCode.NOT_FOUND, 'Assignment not found', 404);
    if (assignment.judgeId !== judgeId) throw new ApiException(ErrorCode.UNAUTHORIZED, 'Not assigned to you', 403);
    if (assignment.status === 'SUBMITTED' || assignment.status === 'LOCKED') throw new ApiException(ErrorCode.VALIDATION_ERROR, 'Already submitted', 400);

    return await this.prisma.$transaction(async (tx) => {
      for (const s of scores) {
        const criterion = await tx.scorecardCriterion.findUnique({ where: { id: s.criterionId } });
        if (!criterion) throw new ApiException(ErrorCode.NOT_FOUND, `Criterion ${s.criterionId} not found`, 404);
        if (s.score > criterion.maxScore || s.score < 0) throw new ApiException(ErrorCode.VALIDATION_ERROR, `Score out of bounds for ${criterion.name}`, 400);

        await tx.judgeScore.upsert({
          where: { assignmentId_criterionId: { assignmentId, criterionId: s.criterionId } },
          update: { score: s.score, remarks: s.remarks },
          create: { assignmentId, criterionId: s.criterionId, score: s.score, remarks: s.remarks }
        });
      }

      await tx.judgeAssignment.update({ where: { id: assignmentId }, data: { status: 'SCORED' } });
      this.eventBus.emit('score.submitted', { assignmentId, judgeId });
      return true;
    });
  }

  async finalizeAssignment(assignmentId: string, judgeId: string): Promise<any> {
    const assignment = await this.prisma.judgeAssignment.findUnique({ where: { id: assignmentId } });
    if (!assignment || assignment.judgeId !== judgeId) throw new ApiException(ErrorCode.UNAUTHORIZED, 'Unauthorized', 403);

    const updated = await this.prisma.judgeAssignment.update({
      where: { id: assignmentId },
      data: { status: 'SUBMITTED' }
    });
    this.eventBus.emit('assignment.finalized', { assignmentId, submissionId: assignment.submissionId });
    return updated;
  }
}

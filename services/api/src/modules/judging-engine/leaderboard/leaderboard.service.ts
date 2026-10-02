import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';
import type { IEventBus } from '../../../common/event-bus/event-bus.interface';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  async recalculateLeaderboard(eventId: string, trackId?: string) {
    // 1. Fetch all locked submissions for the track/event
    const whereClause = trackId ? { problemStatement: { trackId } } : { team: { eventId } };
    const submissions = await this.prisma.submission.findMany({
      where: { ...whereClause, status: { in: ['UNDER_REVIEW', 'SCORED'] } },
      include: {
        team: true,
        judgeAssignments: {
          where: { status: 'SUBMITTED' },
          include: {
            scores: { include: { criterion: true } }
          }
        }
      }
    });

    const teamScores = submissions.map(sub => {
      let totalWeightedScore = 0;
      let judgeCount = sub.judgeAssignments.length;

      sub.judgeAssignments.forEach(assignment => {
        assignment.scores.forEach(score => {
          totalWeightedScore += (score.score * score.criterion.weight);
        });
      });

      const averageScore = judgeCount > 0 ? totalWeightedScore / judgeCount : 0;
      
      // Compute tie breaker payload based on rules (mocked simple for now)
      const tieBreakerData = { earliestSubmission: sub.lockedAt?.getTime() || 0 };

      return {
        teamId: sub.teamId,
        eventId: sub.team.eventId,
        trackId: sub.team.trackId,
        totalScore: totalWeightedScore,
        averageScore,
        judgeCount,
        tieBreakerData
      };
    });

    // 2. Sort by average score DESC (and apply tie breakers if equal)
    teamScores.sort((a, b) => {
      if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
      return a.tieBreakerData.earliestSubmission - b.tieBreakerData.earliestSubmission; // Lower is better (earlier)
    });

    // 3. Upsert Leaderboard table
    await this.prisma.$transaction(async (tx) => {
      // Clear old leaderboard for this segment to avoid stale ranks
      await tx.leaderboard.deleteMany({
        where: trackId ? { trackId } : { eventId, trackId: null }
      });

      const creates = teamScores.map((ts, index) => ({
        eventId: ts.eventId,
        trackId: ts.trackId,
        teamId: ts.teamId,
        rank: index + 1,
        totalScore: ts.totalScore,
        averageScore: ts.averageScore,
        judgeCount: ts.judgeCount,
        tieBreakerData: ts.tieBreakerData
      }));

      await tx.leaderboard.createMany({ data: creates });
    });

    this.eventBus.emit('leaderboard.updated', { eventId, trackId });
    return teamScores;
  }
}

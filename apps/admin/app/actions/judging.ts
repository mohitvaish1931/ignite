"use server";

import { db } from "@project-organizer/sdk";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

export async function getJudgingOverview(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  try {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.SubmissionWhereInput = {};

    if (params.search) {
      where.OR = [
        { team: { name: { contains: params.search, mode: "insensitive" } } },
        { problemStatement: { title: { contains: params.search, mode: "insensitive" } } }
      ];
    }

    const [submissions, total, totalCount, scoredCount] = await Promise.all([
      db.submission.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          team: true,
          problemStatement: {
            include: { track: true }
          },
          judgeAssignments: {
            include: {
              judge: true,
              scores: true
            }
          }
        },
      }),
      db.submission.count({ where }),
      db.submission.count(),
      db.submission.count({ where: { status: "SCORED" } })
    ]);

    return {
      success: true,
      data: {
        submissions: submissions.map((sub) => {
          let totalScore = 0;
          let totalJudgesScored = 0;

          const judges = sub.judgeAssignments.map(assignment => {
            const assignmentScore = assignment.scores.reduce((acc, curr) => acc + curr.score, 0);
            if (["SCORED", "SUBMITTED", "LOCKED"].includes(assignment.status)) {
               totalScore += assignmentScore;
               totalJudgesScored += 1;
            }
            return {
              name: assignment.judge.firstName + " " + (assignment.judge.lastName || ""),
              status: assignment.status,
              score: assignmentScore
            };
          });

          return {
            id: sub.id,
            teamName: sub.team.name,
            trackName: sub.problemStatement?.track?.name || "General Track",
            problemStatement: sub.problemStatement?.title || "N/A",
            status: sub.status,
            judges,
            totalScore: totalJudgesScored > 0 ? (totalScore / totalJudgesScored).toFixed(1) : "-",
            createdAt: sub.createdAt.toISOString(),
          }
        }),
        total,
        pageCount: Math.ceil(total / pageSize),
        stats: {
          totalSubmissions: totalCount,
          scoredSubmissions: scoredCount,
          pendingSubmissions: totalCount - scoredCount
        }
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch judging overview:", error);
    return {
      success: false,
      error: "Failed to load judging data",
    };
  }
}

// ==========================================
// NEW: JURY SETUP LOGIC
// ==========================================

export async function createScorecardTemplate(
  eventId: string,
  name: string,
  criteriaList: { name: string; maxScore: number; weight: number }[]
) {
  try {
    let actualEventId = eventId;
    if (!actualEventId) {
      const firstEvent = await db.event.findFirst();
      if (!firstEvent) throw new Error("No events found in the database to link the scorecard.");
      actualEventId = firstEvent.id;
    }

    const template = await db.scorecardTemplate.create({
      data: {
        eventId: actualEventId,
        name,
        sections: {
          create: {
            name: "Default Section",
            criteria: {
              create: criteriaList.map(c => ({
                name: c.name,
                maxScore: c.maxScore,
                weight: c.weight,
                remarksRequired: true,
              }))
            }
          }
        }
      }
    });
    return { success: true, template };
  } catch (error) {
    console.error("Failed to create scorecard:", error);
    return { success: false, error: "Failed to create marking scheme" };
  }
}

export async function assignJudgeToSubmission(
  submissionId: string,
  email: string,
  password?: string
) {
  try {
    // 1. Find or create the User for the Judge
    let judge = await db.user.findUnique({ where: { email } });
    if (!judge) {
      // Find a default organization
      const org = await db.organization.findFirst();
      if (!org) throw new Error("No organization found");

      const plainPassword = password || Math.random().toString(36).substring(7);
      const passwordHash = await bcrypt.hash(plainPassword, 10);

      judge = await db.user.create({
        data: {
          email,
          firstName: "Judge",
          passwordHash,
          organizationId: org.id
        }
      });
    }

    // Ensure they have the JUDGE role? If not strict, skip.
    
    // 2. Check if assignment exists
    const existing = await db.judgeAssignment.findFirst({
      where: { submissionId, judgeId: judge.id }
    });

    if (existing) {
      return { success: false, error: "Judge is already assigned to this submission." };
    }

    // 3. Create Assignment
    const assignment = await db.judgeAssignment.create({
      data: {
        submissionId,
        judgeId: judge.id,
        status: "ASSIGNED",
      }
    });

    return { success: true, assignment };
  } catch (error) {
    console.error("Failed to assign judge:", error);
    return { success: false, error: "Failed to assign judge" };
  }
}

export async function markSubmissionsUnderReview(submissionIds: string[]) {
  try {
    const updated = await db.submission.updateMany({
      where: { id: { in: submissionIds } },
      data: { status: "UNDER_REVIEW" }
    });
    return { success: true, count: updated.count };
  } catch (error) {
    console.error("Failed to mark submissions under review:", error);
    return { success: false, error: "Failed to update submissions" };
  }
}

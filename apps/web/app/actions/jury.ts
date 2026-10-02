"use server";

import { db } from "@project-organizer/sdk";
import { getCurrentUser } from "./auth";

export async function getJuryAssignments() {
  try {
    const auth = await getCurrentUser();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    const assignments = await db.judgeAssignment.findMany({
      where: { judgeId: auth.user.id },
      include: {
        submission: {
          include: {
            team: true,
            problemStatement: {
              include: {
                track: {
                  include: { event: true }
                }
              }
            },
            versions: {
              include: { assets: true }
            }
          }
        },
        scores: true
      }
    });

    // Also fetch the scorecard templates for these events
    // Assuming 1 global scorecard template per event for simplicity in this MVP
    const eventIds = assignments.map(a => a.submission?.problemStatement?.track?.eventId).filter(Boolean);
    const templates = await db.scorecardTemplate.findMany({
      where: { eventId: { in: eventIds as string[] } },
      include: {
        sections: {
          include: { criteria: true }
        }
      }
    });

    return { success: true, assignments, templates };
  } catch (error) {
    console.error("Failed to fetch jury assignments:", error);
    return { success: false, error: "Failed to fetch assignments" };
  }
}

export async function submitScores(assignmentId: string, criteriaScores: { criterionId: string, score: number }[]) {
  try {
    const auth = await getCurrentUser();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    // Verify assignment belongs to user and is not locked
    const assignment = await db.judgeAssignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment || assignment.judgeId !== auth.user.id) {
      return { success: false, error: "Invalid assignment" };
    }

    if (assignment.status === "SUBMITTED" || assignment.status === "LOCKED") {
      return { success: false, error: "This evaluation has already been locked." };
    }

    // Scores must cover exactly this event's criteria, each within its allowed range
    const submission = assignment.submissionId
      ? await db.submission.findUnique({
          where: { id: assignment.submissionId },
          select: { problemStatement: { select: { track: { select: { eventId: true } } } } },
        })
      : null;
    const eventId = submission?.problemStatement?.track?.eventId;
    if (!eventId) return { success: false, error: "This assignment is not linked to an event." };

    const eventCriteria = await db.scorecardCriterion.findMany({
      where: { section: { template: { eventId } } },
      include: { section: { select: { templateId: true } } },
    });
    if (eventCriteria.length === 0) return { success: false, error: "No marking scheme found for this event." };

    // All submitted scores must come from one of this event's scorecards...
    const submitted = criteriaScores.map(cs => eventCriteria.find(c => c.id === cs.criterionId));
    const templateIds = new Set(submitted.map(c => c?.section.templateId));
    if (submitted.length === 0 || submitted.some(c => !c) || templateIds.size !== 1) {
      return { success: false, error: "Scores don't match this event's marking scheme." };
    }

    // ...and cover every criterion on it, each within its allowed range
    const [templateId] = templateIds;
    const scoreByCriterion = new Map(criteriaScores.map(cs => [cs.criterionId, cs.score]));
    for (const criterion of eventCriteria.filter(c => c.section.templateId === templateId)) {
      const score = scoreByCriterion.get(criterion.id);
      if (score === undefined || !Number.isFinite(score)) {
        return { success: false, error: `Missing score for "${criterion.name}".` };
      }
      if (score < criterion.minScore || score > criterion.maxScore) {
        return { success: false, error: `"${criterion.name}" must be between ${criterion.minScore} and ${criterion.maxScore}.` };
      }
    }

    // Save scores
    await db.$transaction(
      criteriaScores.map(cs => 
        db.judgeScore.upsert({
          where: {
             assignmentId_criterionId: {
               assignmentId,
               criterionId: cs.criterionId
             }
          },
          update: { score: cs.score },
          create: {
            assignmentId,
            criterionId: cs.criterionId,
            score: cs.score
          }
        })
      )
    );

    // Lock the assignment
    await db.judgeAssignment.update({
      where: { id: assignmentId },
      data: { status: "SUBMITTED" }
    });

    // Mark submission as SCORED (if all judges scored, logic simplified here)
    if (assignment.submissionId) {
       await db.submission.update({
         where: { id: assignment.submissionId },
         data: { status: "SCORED" }
       });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to submit scores:", error);
    return { success: false, error: "Failed to submit scores" };
  }
}

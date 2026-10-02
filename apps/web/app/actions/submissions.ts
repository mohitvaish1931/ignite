"use server";

import { db } from "@project-organizer/sdk";
import { getCurrentUser } from "./auth";

// Once judging starts, teams can no longer change their submission
const LOCKED_SUBMISSION_STATES: string[] = ["LOCKED", "UNDER_REVIEW", "SCORED", "WINNER", "ARCHIVED"];

export async function getTeamDetails(teamId: string) {
  try {
    const auth = await getCurrentUser();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        event: {
          include: {
            hackathonTracks: {
              include: { problemStatements: true }
            }
          }
        },
        members: { include: { user: { select: { firstName: true, email: true } } } },
        submissions: {
          include: {
            versions: {
              include: { assets: true }
            }
          }
        }
      }
    });

    if (!team) return { success: false, error: "Team not found" };

    // Verify user is in team
    const isMember = team.members.some(m => m.userId === auth.user?.id);
    if (!isMember) return { success: false, error: "Not a member of this team" };

    return { success: true, team };
  } catch (error) {
    console.error("Failed to fetch team details:", error);
    return { success: false, error: "Failed to fetch team" };
  }
}

export async function submitProject(
  teamId: string, 
  problemStatementId: string, 
  repoUrl: string, 
  demoUrl: string
) {
  try {
    const auth = await getCurrentUser();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    // Verify leader
    const leader = await db.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: auth.user.id } }
    });
    if (!leader || leader.role !== "LEADER") {
      return { success: false, error: "Only team leaders can submit projects." };
    }

    // The chosen problem statement must belong to this team's event
    const team = await db.team.findUnique({ where: { id: teamId }, select: { eventId: true } });
    const problem = await db.problemStatement.findUnique({
      where: { id: problemStatementId },
      select: { track: { select: { eventId: true } } },
    });
    if (!team || problem?.track?.eventId !== team.eventId) {
      return { success: false, error: "Please choose a problem statement from your event." };
    }

    // Check if a submission already exists
    let submission = await db.submission.findFirst({
      where: { teamId }
    });

    if (submission && LOCKED_SUBMISSION_STATES.includes(submission.status)) {
      return { success: false, error: "Submission is locked and cannot be edited." };
    }

    // Rulebook §4: once a problem statement is selected it cannot be changed
    if (submission?.problemStatementId && submission.problemStatementId !== problemStatementId) {
      return { success: false, error: "Your team's problem statement is locked. Once selected, it cannot be changed." };
    }

    if (!submission) {
      submission = await db.submission.create({
        data: {
          teamId,
          problemStatementId,
          status: "SUBMITTED"
        }
      });
    } else {
      submission = await db.submission.update({
        where: { id: submission.id },
        data: { problemStatementId, status: "SUBMITTED" }
      });
    }

    // Create a new version
    const versionCount = await db.submissionVersion.count({
      where: { submissionId: submission.id }
    });

    const version = await db.submissionVersion.create({
      data: {
        submissionId: submission.id,
        versionNumber: versionCount + 1,
      }
    });

    // Add assets
    if (repoUrl) {
      await db.submissionAsset.create({
        data: { submissionVersionId: version.id, type: "REPOSITORY", url: repoUrl }
      });
    }
    if (demoUrl) {
      await db.submissionAsset.create({
        data: { submissionVersionId: version.id, type: "DEMO", url: demoUrl }
      });
    }

    // Update team status
    await db.team.update({
      where: { id: teamId },
      data: { status: "SUBMITTED" }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to submit project:", error);
    return { success: false, error: "Failed to submit project" };
  }
}

"use server";

import crypto from "crypto";
import { db } from "@project-organizer/sdk";
import { getCurrentUser } from "./auth";
import { registerUserForEvent } from "../../lib/registration";
import { MAX_TEAM_SIZE } from "../../lib/hackathon-rules";

export async function getMyTeams() {
  try {
    const auth = await getCurrentUser();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    const members = await db.teamMember.findMany({
      // Teams of removed events stay in the database but leave the participant's list
      where: { userId: auth.user.id, team: { event: { isDeleted: false } } },
      include: {
        team: {
          include: {
            event: { select: { name: true } },
            members: {
              include: { user: { select: { firstName: true, email: true } } }
            },
            invites: {
              where: { status: "PENDING" }
            }
          }
        }
      }
    });

    return { success: true, teams: members.map(m => m.team) };
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return { success: false, error: "Failed to fetch teams" };
  }
}

// 6-character uppercase code without look-alike characters (0/O, 1/I)
const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateJoinCode() {
  const bytes = crypto.randomBytes(6);
  return Array.from(bytes, (b) => JOIN_CODE_ALPHABET[b % JOIN_CODE_ALPHABET.length]).join("");
}

export async function createTeam(eventId: string, name: string) {
  try {
    const auth = await getCurrentUser();
    if (!auth.success || !auth.user) return { success: false, error: "Please log in to create a team." };

    const teamName = name.trim();
    if (!teamName) return { success: false, error: "Team name is required." };

    // One team per participant per event
    const currentTeam = await db.teamMember.findFirst({
      where: { userId: auth.user.id, team: { eventId } },
      include: { team: { select: { name: true } } },
    });
    if (currentTeam) {
      return { success: false, error: `You are already in team "${currentTeam.team.name}" for this event.` };
    }

    const nameTaken = await db.team.findUnique({
      where: { eventId_name: { eventId, name: teamName } },
    });
    if (nameTaken) return { success: false, error: "Team name already taken for this event." };

    // The leader must be registered (and hold a check-in QR) for the event
    const reg = await registerUserForEvent(eventId, auth.user.id);
    if (!reg.success) return { success: false, error: reg.error };

    // Name is known to be free, so a unique violation here is a join code collision
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const team = await db.team.create({
          data: {
            eventId,
            name: teamName,
            status: "DRAFT",
            joinCode: generateJoinCode(),
            members: {
              create: {
                userId: auth.user.id,
                role: "LEADER"
              }
            }
          }
        });
        return { success: true, team };
      } catch (error: any) {
        if (error.code === "P2002") continue;
        throw error;
      }
    }
    return { success: false, error: "Failed to create team. Please try again." };
  } catch (error: any) {
    console.error("Failed to create team:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Team name already taken for this event." };
    }
    return { success: false, error: "Failed to create team" };
  }
}

export async function inviteTeamMember(teamId: string, email: string) {
  try {
    const auth = await getCurrentUser();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    // Verify user is the leader of the team
    const leader = await db.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: auth.user.id } }
    });
    if (!leader || leader.role !== "LEADER") {
      return { success: false, error: "Only team leaders can invite members." };
    }

    // Check if user is already in the team (by email)
    const existingMember = await db.teamMember.findFirst({
      where: { teamId, user: { email: { equals: email.trim(), mode: "insensitive" } } }
    });
    if (existingMember) return { success: false, error: "User is already in the team." };

    // Check if there's a pending invite
    const existingInvite = await db.teamInvite.findFirst({
      where: { teamId, email: { equals: email.trim(), mode: "insensitive" }, status: "PENDING" }
    });
    if (existingInvite) return { success: false, error: "Invite already sent to this email." };

    // Rulebook §2: at most 4 members, counting invites that are still pending
    const [members, pending] = await Promise.all([
      db.teamMember.count({ where: { teamId } }),
      db.teamInvite.count({ where: { teamId, status: "PENDING" } }),
    ]);
    if (members + pending >= MAX_TEAM_SIZE) {
      return { success: false, error: `Teams can have at most ${MAX_TEAM_SIZE} members (including pending invites).` };
    }

    await db.teamInvite.create({
      data: {
        teamId,
        email,
        invitedBy: auth.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to invite member:", error);
    return { success: false, error: "Failed to invite member" };
  }
}

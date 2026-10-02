"use server";

import { db } from "@project-organizer/sdk";
import bcrypt from "bcrypt";
import { createSession } from "../../lib/session";
import { checkEventRegistration, registerUserForEvent } from "../../lib/registration";
import { MAX_TEAM_SIZE } from "../../lib/hackathon-rules";

type RegistrationForm = { name: string; email: string; university: string; year: string; degree: string; password?: string };

/**
 * Finds the account for this email (verifying the password) or creates a new one,
 * and stores the participant's academic details on their profile.
 */
async function findOrCreateParticipant(data: RegistrationForm) {
  if (!data.password) return { error: "Password is required" };

  const email = data.email.trim();
  const metadata = { university: data.university, year: data.year, degree: data.degree };
  const existing = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, isDeleted: false },
  });

  if (existing) {
    const isMatch = await bcrypt.compare(data.password, existing.passwordHash);
    if (!isMatch) return { error: "An account with this email already exists and the password is incorrect." };

    await db.userProfile.upsert({
      where: { userId: existing.id },
      create: { userId: existing.id, metadata },
      update: { metadata },
    });
    return { user: existing };
  }

  if (data.password.length < 8) return { error: "Password must be at least 8 characters" };

  const org = await db.organization.findFirst({ where: { isDeleted: false } });
  if (!org) return { error: "No organization found" };

  const [firstName, ...lastNameParts] = data.name.trim().split(/\s+/);
  const user = await db.user.create({
    data: {
      email,
      firstName,
      lastName: lastNameParts.join(" ") || null,
      passwordHash: await bcrypt.hash(data.password, 10),
      organizationId: org.id,
      profile: { create: { metadata } },
    },
  });
  return { user };
}

export async function registerForEvent(eventId: string, data: RegistrationForm) {
  try {
    // Check the event before creating an account, so closed events don't leave orphan users
    const check = await checkEventRegistration(eventId);
    if (!check.open) return { success: false, error: check.reason };

    const participant = await findOrCreateParticipant(data);
    if (!participant.user) return { success: false, error: participant.error };

    const reg = await registerUserForEvent(eventId, participant.user.id);
    if (!reg.success) return { success: false, error: reg.error };

    await createSession(participant.user.id);
    return { success: true };
  } catch (error: any) {
    console.error("Registration failed:", error);
    return { success: false, error: "Failed to register. Please try again." };
  }
}

export async function joinTeamWithCode(eventId: string, joinCode: string, data: RegistrationForm) {
  try {
    const team = await db.team.findUnique({ where: { joinCode: joinCode.trim().toUpperCase() } });
    if (!team) {
      return { success: false, error: "Invalid Team Token" };
    }
    if (team.eventId !== eventId) {
      return { success: false, error: "This token belongs to a team for a different event" };
    }

    // Rulebook §2: teams have at most 4 members (checked before any account is created)
    const [memberCount, alreadyMember] = await Promise.all([
      db.teamMember.count({ where: { teamId: team.id } }),
      db.teamMember.findFirst({ where: { teamId: team.id, user: { email: { equals: data.email.trim(), mode: "insensitive" } } } }),
    ]);
    if (!alreadyMember && memberCount >= MAX_TEAM_SIZE) {
      return { success: false, error: `Team "${team.name}" is full. Teams can have at most ${MAX_TEAM_SIZE} members.` };
    }

    const participant = await findOrCreateParticipant(data);
    if (!participant.user) return { success: false, error: participant.error };
    const userId = participant.user.id;

    // One team per participant per event
    const currentTeam = await db.teamMember.findFirst({
      where: { userId, team: { eventId } },
      include: { team: { select: { id: true, name: true } } },
    });
    if (currentTeam && currentTeam.team.id !== team.id) {
      return { success: false, error: `You are already in team "${currentTeam.team.name}" for this event.` };
    }

    const reg = await registerUserForEvent(eventId, userId);
    if (!reg.success) return { success: false, error: reg.error };

    if (!currentTeam) {
      await db.teamMember.create({
        data: { teamId: team.id, userId, role: "MEMBER" },
      });
      // A pending invite for this email is now fulfilled
      await db.teamInvite.updateMany({
        where: { teamId: team.id, email: { equals: participant.user.email, mode: "insensitive" }, status: "PENDING" },
        data: { status: "ACCEPTED" },
      });
    }

    await createSession(userId);
    return { success: true, teamName: team.name };
  } catch (error: any) {
    console.error("Join team failed:", error);
    return { success: false, error: "Failed to join team. Please try again." };
  }
}

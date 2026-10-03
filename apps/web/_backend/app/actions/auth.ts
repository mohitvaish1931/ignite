"use server";

import crypto from "crypto";
import { db } from "@project-organizer/sdk";
import bcrypt from "bcrypt";
import { createSession, destroySession, getSessionUserId } from "../../lib/session";
import { createAdminHandoff, isSuperAdmin, type StaffRole } from "../../lib/admin-handoff";

type LoginResult =
  | { success: false; error: string }
  | { success: true; destination: "web"; redirectTo: string }
  | { success: true; destination: "admin"; handoff: { url: string; token: string } };

/**
 * The single login for everyone. Credentials decide where the user lands:
 * participants go to their dashboard, organizers/admins to the admin panel
 * and volunteers to the admin QR scanner.
 */
export async function loginUser(email: string, password?: string): Promise<LoginResult> {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    if (isSuperAdmin(email, password)) {
      const handoff = await createAdminHandoff({ userId: "super-admin-id", email: email.trim().toLowerCase(), role: "SUPER_ADMIN" });
      return { success: true, destination: "admin", handoff };
    }

    const user = await db.user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" }, isDeleted: false },
      include: { eventAssignments: { select: { role: true } } },
    });

    // Same message for unknown email and wrong password, so accounts can't be enumerated
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return { success: false, error: "Invalid email or password. New here? Register for an event to create your account." };
    }

    // Staff are also regular users of the site, so they stay logged in here too
    await createSession(user.id);

    const roles = user.eventAssignments.map((a) => a.role);
    const staffRole: StaffRole | null = roles.includes("ORGANIZER") ? "ORGANIZER" : roles.includes("VOLUNTEER") ? "VOLUNTEER" : null;
    if (staffRole) {
      const handoff = await createAdminHandoff({ userId: user.id, email: user.email, role: staffRole });
      return { success: true, destination: "admin", handoff };
    }

    return { success: true, destination: "web", redirectTo: "/dashboard" };
  } catch (error) {
    console.error("Login failed:", error);
    return { success: false, error: "Failed to login" };
  }
}

export async function logoutUser() {
  await destroySession();
  return { success: true };
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, user: null };

  const found = await db.user.findFirst({
    where: { id: userId, isDeleted: false },
    select: { id: true, email: true, firstName: true, publicId: true, _count: { select: { judgeAssignments: true } } }
  });

  if (!found) return { success: false, user: null };

  const { _count, ...user } = found;
  return { success: true, user: { ...user, isJudge: _count.judgeAssignments > 0 } };
}

export async function requestPasswordReset(email: string) {
  const genericMessage = "If an account exists for this email, a reset link has been generated.";
  try {
    const user = await db.user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" }, isDeleted: false },
    });
    if (!user) {
      // Don't leak whether user exists
      return { success: true, message: genericMessage };
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Valid for 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.passwordReset.create({
      data: {
        email: user.email,
        tokenHash,
        expiresAt,
      }
    });

    // No email service is wired up yet. Handing the link back to whoever typed the
    // email would let anyone reset anyone's password, so only do it in development.
    if (process.env.NODE_ENV !== "production") {
      return { success: true, message: genericMessage, resetLink: `/reset-password?token=${rawToken}` };
    }
    return { success: true, message: genericMessage };
  } catch (error) {
    console.error("Failed to request reset:", error);
    return { success: false, error: "Failed to request password reset" };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" };
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetRequest = await db.passwordReset.findUnique({
      where: { tokenHash },
    });

    if (!resetRequest) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    if (resetRequest.isUsed) {
      return { success: false, error: "This reset link has already been used" };
    }

    if (resetRequest.expiresAt < new Date()) {
      return { success: false, error: "This reset link has expired" };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password and mark token as used in a transaction
    await db.$transaction([
      db.user.update({
        where: { email: resetRequest.email },
        data: { passwordHash },
      }),
      db.passwordReset.update({
        where: { id: resetRequest.id },
        data: { isUsed: true },
      })
    ]);

    return { success: true };
  } catch (error) {
    console.error("Failed to reset password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

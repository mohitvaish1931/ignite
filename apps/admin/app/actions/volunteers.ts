"use server";

import { db } from "@project-organizer/sdk";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getAdminJwtSecret } from "../../lib/auth-secret";

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return { isAuth: false, role: null, userId: null };
  try {
    const { payload } = await jwtVerify(token, getAdminJwtSecret());
    return { isAuth: true, role: payload.role, userId: payload.userId };
  } catch {
    return { isAuth: false, role: null, userId: null };
  }
}

export async function assignVolunteer(eventId: string, email: string) {
  try {
    const auth = await verifyAuth();
    if (!auth.isAuth || (auth.role !== "SUPER_ADMIN" && auth.role !== "ORGANIZER")) {
      return { success: false, error: "Unauthorized" };
    }

    const org = await db.organization.findFirst();
    if (!org) return { success: false, error: "No organization found" };

    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash("ieee@2026", 10);
      user = await db.user.create({
        data: {
          email,
          firstName: "Volunteer",
          passwordHash,
          organizationId: org.id
        }
      });
    }

    const existingAssignment = await db.eventAssignment.findUnique({
      where: {
        eventId_userId_role: {
          eventId,
          userId: user.id,
          role: "VOLUNTEER"
        }
      }
    });

    if (existingAssignment) {
      return { success: false, error: "User is already a volunteer for this event" };
    }

    const assignment = await db.eventAssignment.create({
      data: {
        eventId,
        userId: user.id,
        role: "VOLUNTEER"
      }
    });

    return { success: true, assignment };
  } catch (error: any) {
    console.error("Failed to assign volunteer:", error);
    return { success: false, error: error.message || "Failed to assign volunteer" };
  }
}

export async function getVolunteersOverview() {
  try {
    const auth = await verifyAuth();
    if (!auth.isAuth || (auth.role !== "SUPER_ADMIN" && auth.role !== "ORGANIZER")) {
      return { success: false, error: "Unauthorized" };
    }

    // Get events this user manages, or all if super admin
    const whereClause: Prisma.EventWhereInput = auth.role === "SUPER_ADMIN"
      ? {}
      : {
          eventAssignments: {
            some: {
              userId: String(auth.userId),
              role: "ORGANIZER"
            }
          }
        };

    const events = await db.event.findMany({
      where: whereClause,
      include: {
        eventAssignments: {
          where: { role: "VOLUNTEER" },
          include: { user: true }
        }
      }
    });

    return { 
      success: true, 
      data: events.map(e => ({
        id: e.id,
        title: e.name,
        publicId: e.publicId,
        state: e.state,
        volunteers: e.eventAssignments.map(a => ({
          id: a.user.id,
          name: a.user.firstName,
          email: a.user.email,
          status: a.status
        }))
      }))
    };
  } catch (error: any) {
    console.error("Failed to get volunteers overview:", error);
    return { success: false, error: "Failed to load volunteers data" };
  }
}

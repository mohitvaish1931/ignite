"use server";

import { db } from "@project-organizer/sdk";
import { getSessionUserId } from "../../lib/session";
import { ensureRegistrationQr } from "../../lib/registration";

export async function getDashboardData() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return { success: false };

    const user = await db.user.findFirst({
      where: { id: userId, isDeleted: false },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (!user) return { success: false };

    const registrations = await db.eventRegistration.findMany({
      where: { userId, event: { isDeleted: false } },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startAt: true,
            endAt: true,
            _count: { select: { registrations: true } },
          }
        }
      },
      orderBy: { event: { startAt: "asc" } }
    });

    const regsWithQr = await Promise.all(
      registrations.map(async (reg) => ({
        ...reg,
        qrCode: await ensureRegistrationQr(reg.id),
      }))
    );

    const teams = await db.teamMember.findMany({
      where: { userId, team: { event: { isDeleted: false } } },
      include: {
        team: {
          include: {
            event: {
              select: { name: true }
            },
            _count: {
              select: { members: true }
            }
          }
        }
      },
      orderBy: { joinedAt: "desc" }
    });

    return { success: true, user, registrations: regsWithQr, teams };
  } catch (error) {
    console.error("Failed to fetch dashboard data", error);
    return { success: false };
  }
}

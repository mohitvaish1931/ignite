"use server";

import { db } from "@project-organizer/sdk";
import { Prisma } from "@prisma/client";
import { OPEN_EVENT_STATES } from "../../lib/registration";

export async function getPublicEvents(params?: { category?: string; hackathonsOnly?: boolean; limit?: number }) {
  try {
    // Only published events that haven't ended; drafts and archived events stay private
    const whereClause: Prisma.EventWhereInput = {
      isDeleted: false,
      visibility: "PUBLIC",
      state: { in: [...OPEN_EVENT_STATES] },
      endAt: {
        gte: new Date()
      }
    };

    if (params?.category) {
      whereClause.category = {
        name: { contains: params.category, mode: "insensitive" }
      };
    }

    // Same rule the event page uses: a hackathon is anything with tracks (or filed under Hackathon)
    if (params?.hackathonsOnly) {
      whereClause.OR = [
        { hackathonTracks: { some: {} } },
        { category: { name: { contains: "Hackathon", mode: "insensitive" } } },
      ];
    }

    const events = await db.event.findMany({
      where: whereClause,
      orderBy: {
        startAt: 'asc'
      },
      include: {
        organization: {
          select: { name: true }
        },
        category: {
          select: { name: true }
        },
        settings: true,
        _count: {
          select: { hackathonTracks: true, teams: true, registrations: true }
        }
      },
      take: Math.min(params?.limit ?? 60, 100)
    });

    return { success: true, data: events };
  } catch (error) {
    console.error("Failed to fetch public events:", error);
    return { success: false, error: "Failed to load events" };
  }
}

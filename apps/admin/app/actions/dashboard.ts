"use server";

import { db } from "@project-organizer/sdk";

const OPEN_STATES = ["PUBLISHED", "REGISTRATION_OPEN", "LIVE"] as const;
const DAYS = 30;

/** One bucket per day for the last `DAYS` days, so charts show gaps as zeros. */
function dailySeries(dates: Date[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = new Map<string, number>();
  const keys: { key: string; label: string }[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toDateString();
    buckets.set(key, 0);
    keys.push({ key, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
  }
  for (const date of dates) {
    const key = date.toDateString();
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + 1);
  }
  return keys.map(({ key, label }) => ({ name: label, value: buckets.get(key)! }));
}

export async function getDashboardStats() {
  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (DAYS - 1));

    // Same rule as the public site: a hackathon has tracks or is filed under a "Hackathon" category
    const isHackathon = {
      OR: [
        { hackathonTracks: { some: {} } },
        { category: { name: { contains: "Hackathon", mode: "insensitive" as const } } },
      ],
    };

    // Run queries in parallel for performance
    const [totalEvents, activeHackathons, totalParticipants, liveCheckins, recentRegistrations, recentUsers, hackathons, topEvents] = await Promise.all([
      db.event.count({ where: { isDeleted: false } }),
      db.event.count({
        where: { isDeleted: false, state: { in: [...OPEN_STATES] }, endAt: { gte: new Date() }, ...isHackathon },
      }),
      db.user.count({ where: { isDeleted: false } }),
      db.eventRegistration.count({ where: { checkedIn: true } }),
      db.eventRegistration.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      db.user.findMany({ where: { createdAt: { gte: since }, isDeleted: false }, select: { createdAt: true } }),
      db.event.findMany({
        where: { isDeleted: false, ...isHackathon },
        orderBy: { startAt: "desc" },
        take: 4,
        select: { id: true, name: true, state: true, startAt: true, endAt: true, _count: { select: { registrations: true } } },
      }),
      db.event.findMany({
        where: { isDeleted: false },
        orderBy: { registrations: { _count: "desc" } },
        take: 3,
        select: { id: true, name: true, state: true, startAt: true, endAt: true, _count: { select: { registrations: true } } },
      }),
    ]);

    return {
      success: true,
      data: {
        totalEvents,
        activeHackathons,
        totalParticipants,
        liveCheckins,
        chartData: dailySeries(recentRegistrations.map((r) => r.createdAt)),
        userGrowthData: dailySeries(recentUsers.map((u) => u.createdAt)),
        newUsers: recentUsers.length,
        recentHackathons: hackathons,
        topEvents,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      error: "Failed to load dashboard metrics",
    };
  }
}

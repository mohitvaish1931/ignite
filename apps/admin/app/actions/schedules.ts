"use server";

import { db } from "@project-organizer/sdk";

export async function createSchedule(data: { eventId: string; name: string; date: string }) {
  try {
    const schedule = await db.schedule.create({
      data: {
        eventId: data.eventId,
        name: data.name + " (" + data.date + ")", // Store date in name since date field doesn't exist
      }
    });

    return { success: true, data: schedule.id };
  } catch (error: any) {
    console.error("Failed to create schedule:", error);
    return { success: false, error: error.message || "Failed to create schedule" };
  }
}

export async function createSession(data: {
  scheduleId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  capacity?: number;
}) {
  try {
    const session = await db.session.create({
      data: {
        scheduleId: data.scheduleId,
        title: data.title,
        description: data.description,
        startAt: new Date(data.startTime).toISOString(),
        endAt: new Date(data.endTime).toISOString(),
      }
    });

    return { success: true, data: session.id };
  } catch (error: any) {
    console.error("Failed to create session:", error);
    return { success: false, error: error.message || "Failed to create session" };
  }
}

export async function getSchedulesByEventId(eventId: string) {
  try {
    const schedules = await db.schedule.findMany({
      where: { eventId },
      include: {
        sessions: {
          orderBy: { startAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Serialize dates for Client Component passing
    return { 
      success: true, 
      data: schedules.map(s => ({
        id: s.id,
        name: s.name,
        date: s.createdAt.toISOString(), // Fallback since date doesn't exist
        sessions: s.sessions.map(sess => ({
          id: sess.id,
          title: sess.title,
          description: sess.description,
          startTime: sess.startAt.toISOString(),
          endTime: sess.endAt.toISOString(),
          capacity: 0 // capacity doesn't exist on Session
        }))
      }))
    };
  } catch (error: any) {
    console.error("Failed to fetch schedules:", error);
    return { success: false, error: error.message || "Failed to fetch schedules" };
  }
}

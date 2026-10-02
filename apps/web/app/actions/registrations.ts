"use server";

import { db } from "@project-organizer/sdk";
import { getCurrentUser } from "./auth";
import { ensureRegistrationQr, getRegistrationStatus } from "../../lib/registration";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Loads an event by id, or by slug so rulebooks can link to /events/<slug>. */
export async function getEventDetails(idOrSlug: string) {
  try {
    const event = await db.event.findFirst({
      where: UUID.test(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug, isDeleted: false },
      include: {
        organization: true,
        category: { select: { name: true } },
        hackathonTracks: true,
        _count: { select: { registrations: true } },
      }
    });

    if (!event || event.isDeleted) return { success: false, error: "Event not found" };

    // Check if current user is registered
    const auth = await getCurrentUser();
    let isRegistered = false;
    let checkedIn = false;
    let qrCode: string | null = null;

    if (auth.success && auth.user) {
      const reg = await db.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: auth.user.id } }
      });
      if (reg) {
        isRegistered = true;
        checkedIn = reg.checkedIn;
        qrCode = await ensureRegistrationQr(reg.id);
      }
    }

    const registration = getRegistrationStatus({ ...event, registrationCount: event._count.registrations });

    return {
      success: true,
      data: {
        event,
        isRegistered,
        checkedIn,
        qrCode,
        registrationOpen: registration.open,
        registrationClosedReason: registration.open ? null : registration.reason,
      }
    };
  } catch (error) {
    console.error("Failed to fetch event details:", error);
    return { success: false, error: "Failed to fetch event" };
  }
}

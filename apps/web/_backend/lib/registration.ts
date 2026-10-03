// Server-only registration helpers (not server actions — see lib/session.ts).
import crypto from "crypto";
import { db } from "@project-organizer/sdk";

// States in which an event is visible to the public and accepts registrations
export const OPEN_EVENT_STATES = ["PUBLISHED", "REGISTRATION_OPEN", "LIVE"] as const;

type RegistrationCheck =
  | { open: true }
  | { open: false; reason: string };

export function getRegistrationStatus(event: {
  isDeleted: boolean;
  state: string;
  endAt: Date;
  registrationStartAt: Date | null;
  registrationEndAt: Date | null;
  capacity: number | null;
  registrationCount: number;
}): RegistrationCheck {
  const now = new Date();
  if (event.isDeleted) return { open: false, reason: "This event is no longer available." };
  if (!(OPEN_EVENT_STATES as readonly string[]).includes(event.state)) {
    return { open: false, reason: "Registrations are not open for this event." };
  }
  if (event.endAt < now) return { open: false, reason: "This event has already ended." };
  if (event.registrationStartAt && event.registrationStartAt > now) {
    return {
      open: false,
      reason: `Registrations open on ${event.registrationStartAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
    };
  }
  if (event.registrationEndAt && event.registrationEndAt < now) {
    return { open: false, reason: "Registrations for this event have closed." };
  }
  if (event.capacity && event.registrationCount >= event.capacity) {
    return { open: false, reason: "This event is full." };
  }
  return { open: true };
}

export async function checkEventRegistration(eventId: string): Promise<RegistrationCheck> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event) return { open: false, reason: "Event not found." };
  return getRegistrationStatus({ ...event, registrationCount: event._count.registrations });
}

export function generateQrToken() {
  return crypto.randomBytes(24).toString("base64url");
}

/** Returns the registration's check-in token, issuing one if it was never created. */
export async function ensureRegistrationQr(registrationId: string) {
  const qr = await db.qRCode.findFirst({
    where: { referenceId: registrationId, type: "REGISTRATION" },
  });
  if (qr) return qr.token;

  const created = await db.qRCode.create({
    data: {
      type: "REGISTRATION",
      referenceId: registrationId,
      token: generateQrToken(),
      usagePolicy: "MULTIPLE",
      usageLimit: 10,
    },
  });
  return created.token;
}

/**
 * Registers a user for an event and issues their check-in QR code.
 * Idempotent: returns the existing registration if the user is already registered.
 */
export async function registerUserForEvent(eventId: string, userId: string) {
  const existing = await db.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (existing) {
    await ensureRegistrationQr(existing.id);
    return { success: true as const, registrationId: existing.id, alreadyRegistered: true };
  }

  const check = await checkEventRegistration(eventId);
  if (!check.open) return { success: false as const, error: check.reason };

  const registration = await db.$transaction(async (tx) => {
    const reg = await tx.eventRegistration.create({
      data: { eventId, userId, status: "APPROVED" },
    });
    await tx.qRCode.create({
      data: {
        type: "REGISTRATION",
        referenceId: reg.id,
        token: generateQrToken(),
        usagePolicy: "MULTIPLE",
        usageLimit: 10,
      },
    });
    return reg;
  });

  return { success: true as const, registrationId: registration.id, alreadyRegistered: false };
}

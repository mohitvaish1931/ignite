import { NextResponse } from "next/server";
import { db } from "@project-organizer/sdk";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { ScanResult } from "@prisma/client";
import { getAdminJwtSecret } from "../../../lib/auth-secret";

const SCANNER_ROLES = ["SUPER_ADMIN", "ORGANIZER", "VOLUNTEER"];
const WEB_SCANNER_NAME = "Admin Web Scanner";

async function getScannerOperator() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAdminJwtSecret());
    if (typeof payload.role !== "string" || !SCANNER_ROLES.includes(payload.role)) return null;
    return { role: payload.role, userId: String(payload.userId) };
  } catch {
    return null;
  }
}

/** ScanLog rows need a device; browser-based scans share one per organization. */
async function getWebScannerId(organizationId: string) {
  const existing = await db.scannerDevice.findFirst({
    where: { organizationId, name: WEB_SCANNER_NAME },
  });
  if (existing) {
    await db.scannerDevice.update({ where: { id: existing.id }, data: { lastSeen: new Date() } });
    return existing.id;
  }
  const created = await db.scannerDevice.create({
    data: { organizationId, name: WEB_SCANNER_NAME, status: "ACTIVE", lastSeen: new Date() },
  });
  return created.id;
}

export async function POST(request: Request) {
  try {
    const operator = await getScannerOperator();
    if (!operator) {
      return NextResponse.json({ success: false, message: "Unauthorized. Please log in to the admin panel." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 400 });
    }

    // Tickets live in the QRCode table (referenceId -> registration).
    // Older registrations may carry the token directly on the registration.
    const qr = await db.qRCode.findUnique({ where: { token } });
    const registration = qr
      ? qr.type === "REGISTRATION"
        ? await db.eventRegistration.findUnique({ where: { id: qr.referenceId }, include: { user: true, event: true } })
        : null
      : await db.eventRegistration.findUnique({ where: { qrCode: token }, include: { user: true, event: true } });

    if (!registration) {
      return NextResponse.json({ success: false, message: "Invalid QR Code. This is not an event ticket." }, { status: 404 });
    }

    const { user, event } = registration;
    const participant = {
      user: user.firstName + (user.lastName ? " " + user.lastName : ""),
      email: user.email,
      event: event.name,
    };

    // Organizers and volunteers may only check people into events they are assigned to
    if (operator.role !== "SUPER_ADMIN") {
      const assignment = await db.eventAssignment.findFirst({
        where: { userId: operator.userId, eventId: event.id },
      });
      if (!assignment) {
        return NextResponse.json({
          success: false,
          message: `You are not assigned to "${event.name}".`,
          data: participant,
        }, { status: 403 });
      }
    }

    const scannerId = qr ? await getWebScannerId(event.organizationId) : null;
    const device = request.headers.get("user-agent")?.slice(0, 250) || "unknown";

    const reject = async (result: ScanResult, message: string, status: number, extra: object = {}) => {
      if (qr && scannerId) {
        await db.scanLog.create({
          data: { qrCodeId: qr.id, scannerId, eventId: event.id, scanType: "ENTRY", result, failureReason: message, device },
        });
      }
      return NextResponse.json({ success: false, message, data: { ...participant, ...extra } }, { status });
    };

    if (qr?.status === "REVOKED") return reject("REVOKED", "This ticket has been revoked.", 400);
    if (qr && (qr.status === "EXPIRED" || (qr.expiresAt && qr.expiresAt < new Date()))) {
      return reject("EXPIRED", "This ticket has expired.", 400);
    }
    if (registration.status !== "APPROVED" && registration.status !== "CHECKED_IN") {
      return reject("NOT_APPROVED", `Registration is ${registration.status.toLowerCase()}, not approved.`, 400);
    }
    if (registration.checkedIn) {
      return reject("ALREADY_CHECKED_IN", "Already checked in", 409, { checkedInAt: registration.checkedInAt });
    }
    if (qr && qr.usageCount >= qr.usageLimit) {
      return reject("USAGE_LIMIT", "This ticket has reached its scan limit.", 400);
    }
    if (event.endAt < new Date()) {
      return reject("OUTSIDE_TIME", "This event has already ended.", 400);
    }

    const now = new Date();
    const checkedIn = await db.$transaction(async (tx) => {
      // Conditional update so two simultaneous scans can't both check in
      const updated = await tx.eventRegistration.updateMany({
        where: { id: registration.id, checkedIn: false },
        data: { checkedIn: true, checkedInAt: now, status: "CHECKED_IN" },
      });
      if (updated.count === 0) return false;

      if (qr) {
        await tx.qRCode.update({ where: { id: qr.id }, data: { usageCount: { increment: 1 } } });
      }
      await tx.attendance.upsert({
        where: { eventId_userId_scanType: { eventId: event.id, userId: user.id, scanType: "ENTRY" } },
        create: { eventId: event.id, userId: user.id, scanType: "ENTRY", firstScannedAt: now, lastScannedAt: now },
        update: { lastScannedAt: now, scanCount: { increment: 1 } },
      });
      return true;
    });

    if (!checkedIn) {
      return reject("ALREADY_CHECKED_IN", "Already checked in", 409);
    }

    if (qr && scannerId) {
      await db.scanLog.create({
        data: { qrCodeId: qr.id, scannerId, eventId: event.id, scanType: "ENTRY", result: "SUCCESS", device },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Check-in successful",
      data: participant,
    });

  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

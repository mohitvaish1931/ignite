import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';
import type { IEventBus } from '../../../common/event-bus/event-bus.interface';
import { QRCode, ScannerDevice, Event, ScanResult, ScanType } from '@prisma/client';
import { ScanLoggerService } from '../scan-logger/scan-logger.service';

export interface CheckInContext {
  qr: QRCode;
  scanner: ScannerDevice;
  event: Event;
  scanType: ScanType;
  venueId?: string;
  deviceInfo: string;
  gpsLocation?: any;
}

export interface ICheckInRule {
  evaluate(ctx: CheckInContext): Promise<{ success: boolean; result?: ScanResult; reason?: string }>;
}

class ExpiryRule implements ICheckInRule {
  async evaluate({ qr }: CheckInContext) {
    if (qr.status === 'EXPIRED' || (qr.expiresAt && qr.expiresAt < new Date())) {
      return { success: false, result: 'EXPIRED' as ScanResult, reason: 'QR Code is expired' };
    }
    return { success: true };
  }
}

class RevokedRule implements ICheckInRule {
  async evaluate({ qr }: CheckInContext) {
    if (qr.status === 'REVOKED') {
      return { success: false, result: 'REVOKED' as ScanResult, reason: 'QR Code was revoked' };
    }
    return { success: true };
  }
}

class UsageLimitRule implements ICheckInRule {
  async evaluate({ qr }: CheckInContext) {
    if (qr.usageCount >= qr.usageLimit) {
      return { success: false, result: 'USAGE_LIMIT' as ScanResult, reason: 'Usage limit reached' };
    }
    return { success: true };
  }
}

@Injectable()
export class CheckInDomainService {
  private rules: ICheckInRule[] = [
    new RevokedRule(),
    new ExpiryRule(),
    new UsageLimitRule(),
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly scanLogger: ScanLoggerService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  async processScan(token: string, scannerId: string, scanType: ScanType, deviceInfo: string, venueId?: string, gpsLocation?: any) {
    // 1. Load context
    const qr = await this.prisma.qRCode.findUnique({ where: { token } });
    const scanner = await this.prisma.scannerDevice.findUnique({ where: { id: scannerId } });

    if (!qr || !scanner) {
      await this.scanLogger.logFailedScan(qr?.id, scannerId, scanType, 'INVALID_QR', 'QR or Scanner not found', deviceInfo, gpsLocation);
      return { success: false, result: 'INVALID_QR', reason: 'Invalid QR token' };
    }

    const eventId = scanner.organizationId; // For simplicity in this demo, event logic should map from referenceId
    const event = await this.prisma.event.findFirst({ where: { organizationId: scanner.organizationId }});

    if (!event) return { success: false, result: 'INVALID_QR', reason: 'Event not found' };

    const ctx: CheckInContext = { qr, scanner, event, scanType, venueId, deviceInfo, gpsLocation };

    // 2. Evaluate Rules
    for (const rule of this.rules) {
      const evaluation = await rule.evaluate(ctx);
      if (!evaluation.success) {
        await this.scanLogger.logFailedScan(qr.id, scanner.id, scanType, evaluation.result!, evaluation.reason, deviceInfo, gpsLocation);
        this.eventBus.emit('checkin.failed', { qrId: qr.id, reason: evaluation.reason });
        return evaluation;
      }
    }

    // 3. Process Transactional Update
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Increment usage
        const updatedQr = await tx.qRCode.update({
          where: { id: qr.id },
          data: { usageCount: { increment: 1 } }
        });

        // Mark Attendance (UPSERT)
        // Note: Real implementation would look up User from referenceId
        
        return updatedQr;
      });

      // 4. Log Success
      await this.scanLogger.logSuccessScan(qr.id, scanner.id, event.id, scanType, venueId, deviceInfo, gpsLocation);
      this.eventBus.emit('checkin.succeeded', { qrId: qr.id, scannerId: scanner.id });

      return { success: true, result: 'SUCCESS', qr: result };
    } catch (error: any) {
      return { success: false, result: 'ALREADY_CHECKED_IN', reason: error.message };
    }
  }
}

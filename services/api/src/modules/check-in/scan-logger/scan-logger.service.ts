import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ScanResult, ScanType } from '@prisma/client';

@Injectable()
export class ScanLoggerService {
  constructor(private readonly prisma: PrismaService) {}

  async logFailedScan(
    qrCodeId: string | undefined,
    scannerId: string,
    scanType: ScanType,
    result: ScanResult,
    reason: string | undefined,
    deviceInfo: string,
    gpsLocation?: any
  ) {
    if (!qrCodeId) return; // Cant log if QR doesn't exist
    await this.prisma.scanLog.create({
      data: {
        qrCodeId,
        scannerId,
        eventId: scannerId, // mock for now
        scanType,
        result,
        failureReason: reason,
        device: deviceInfo,
        gpsLocation,
        idempotencyKey: `fail_${Date.now()}_${qrCodeId}`
      }
    }).catch(() => null); // Fail silently for logs
  }

  async logSuccessScan(
    qrCodeId: string,
    scannerId: string,
    eventId: string,
    scanType: ScanType,
    venueId: string | undefined,
    deviceInfo: string,
    gpsLocation?: any
  ) {
    await this.prisma.scanLog.create({
      data: {
        qrCodeId,
        scannerId,
        eventId,
        venueId,
        scanType,
        result: 'SUCCESS',
        device: deviceInfo,
        gpsLocation,
        idempotencyKey: `succ_${Date.now()}_${qrCodeId}`
      }
    });
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';
import type { IEventBus } from '../../../common/event-bus/event-bus.interface';
import { QR_PROVIDER } from '../interfaces/qr-provider.interface';
import type { IQRProvider } from '../interfaces/qr-provider.interface';
import { QrType, QrUsagePolicy, QrStatus, QRCode } from '@prisma/client';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/exceptions/error-codes.enum';

@Injectable()
export class QrDomainService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    @Inject(QR_PROVIDER) private readonly qrProvider: IQRProvider
  ) {}

  async generateQrCode(
    type: QrType,
    referenceId: string,
    usagePolicy: QrUsagePolicy = 'SINGLE',
    usageLimit: number = 1,
    expiresAt?: Date
  ): Promise<QRCode> {
    const token = await this.qrProvider.generateToken();

    const qr = await this.prisma.qRCode.create({
      data: {
        type,
        referenceId,
        token,
        usagePolicy,
        usageLimit: usagePolicy === 'UNLIMITED' ? 999999 : usageLimit,
        expiresAt,
        status: 'ACTIVE'
      }
    });

    this.eventBus.emit('qr.generated', { qrId: qr.id, type, referenceId });
    return qr;
  }

  async revokeQrCode(id: string): Promise<QRCode> {
    const qr = await this.prisma.qRCode.update({
      where: { id },
      data: { status: 'REVOKED' }
    });
    this.eventBus.emit('qr.revoked', { qrId: qr.id });
    return qr;
  }
}

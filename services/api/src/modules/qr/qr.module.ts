import { Module } from '@nestjs/common';
import { QrDomainService } from './qr-domain/qr-domain.service';
import { QrController } from './qr.controller';
import { QR_PROVIDER } from './interfaces/qr-provider.interface';
import { DefaultQrProvider } from './providers/default-qr.provider';

@Module({
  providers: [
    QrDomainService,
    {
      provide: QR_PROVIDER,
      useClass: DefaultQrProvider,
    },
  ],
  controllers: [QrController],
  exports: [QrDomainService, QR_PROVIDER],
})
export class QrModule {}

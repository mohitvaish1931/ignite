import { Module } from '@nestjs/common';
import { CheckInDomainService } from './check-in-domain/check-in-domain.service';
import { ScanLoggerService } from './scan-logger/scan-logger.service';
import { CheckInController } from './check-in.controller';

@Module({
  providers: [CheckInDomainService, ScanLoggerService],
  controllers: [CheckInController],
  exports: [CheckInDomainService]
})
export class CheckInModule {}

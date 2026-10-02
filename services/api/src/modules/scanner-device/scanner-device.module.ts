import { Module } from '@nestjs/common';
import { ScannerDeviceService } from './scanner-device.service';
import { ScannerDeviceController } from './scanner-device.controller';

@Module({
  providers: [ScannerDeviceService],
  controllers: [ScannerDeviceController]
})
export class ScannerDeviceModule {}

import { Test, TestingModule } from '@nestjs/testing';
import { ScannerDeviceService } from './scanner-device.service';

describe('ScannerDeviceService', () => {
  let service: ScannerDeviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScannerDeviceService],
    }).compile();

    service = module.get<ScannerDeviceService>(ScannerDeviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

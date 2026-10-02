import { Test, TestingModule } from '@nestjs/testing';
import { ScanLoggerService } from './scan-logger.service';

describe('ScanLoggerService', () => {
  let service: ScanLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScanLoggerService],
    }).compile();

    service = module.get<ScanLoggerService>(ScanLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

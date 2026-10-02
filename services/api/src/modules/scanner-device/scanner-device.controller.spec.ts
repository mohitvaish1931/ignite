import { Test, TestingModule } from '@nestjs/testing';
import { ScannerDeviceController } from './scanner-device.controller';

describe('ScannerDeviceController', () => {
  let controller: ScannerDeviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScannerDeviceController],
    }).compile();

    controller = module.get<ScannerDeviceController>(ScannerDeviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

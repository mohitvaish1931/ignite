import { Test, TestingModule } from '@nestjs/testing';
import { CheckInDomainService } from './check-in-domain.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';
import { ScanLoggerService } from '../scan-logger/scan-logger.service';

const mockPrisma = {
  qRCode: { findUnique: jest.fn(), update: jest.fn() },
  scannerDevice: { findUnique: jest.fn() },
  event: { findFirst: jest.fn() },
  $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma))
};

const mockEventBus = { emit: jest.fn() };
const mockScanLogger = { logFailedScan: jest.fn(), logSuccessScan: jest.fn() };

describe('CheckInDomainService', () => {
  let service: CheckInDomainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckInDomainService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EVENT_BUS, useValue: mockEventBus },
        { provide: ScanLoggerService, useValue: mockScanLogger }
      ],
    }).compile();

    service = module.get<CheckInDomainService>(CheckInDomainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject an expired QR code', async () => {
    mockPrisma.qRCode.findUnique.mockResolvedValueOnce({ id: 'qr_1', status: 'ACTIVE', expiresAt: new Date(Date.now() - 10000) });
    mockPrisma.scannerDevice.findUnique.mockResolvedValueOnce({ id: 'scan_1', organizationId: 'org_1' });
    mockPrisma.event.findFirst.mockResolvedValueOnce({ id: 'evt_1' });

    const result = await service.processScan('token', 'scan_1', 'ENTRY', 'iphone');

    expect(result.success).toBe(false);
    expect(result.result).toBe('EXPIRED');
    expect(mockScanLogger.logFailedScan).toHaveBeenCalledWith('qr_1', 'scan_1', 'ENTRY', 'EXPIRED', expect.any(String), 'iphone', undefined);
  });

  it('should reject a revoked QR code', async () => {
    mockPrisma.qRCode.findUnique.mockResolvedValueOnce({ id: 'qr_1', status: 'REVOKED' });
    mockPrisma.scannerDevice.findUnique.mockResolvedValueOnce({ id: 'scan_1', organizationId: 'org_1' });
    mockPrisma.event.findFirst.mockResolvedValueOnce({ id: 'evt_1' });

    const result = await service.processScan('token', 'scan_1', 'ENTRY', 'iphone');

    expect(result.success).toBe(false);
    expect(result.result).toBe('REVOKED');
  });

  it('should reject if usage limit reached', async () => {
    mockPrisma.qRCode.findUnique.mockResolvedValueOnce({ id: 'qr_1', status: 'ACTIVE', usageLimit: 1, usageCount: 1 });
    mockPrisma.scannerDevice.findUnique.mockResolvedValueOnce({ id: 'scan_1', organizationId: 'org_1' });
    mockPrisma.event.findFirst.mockResolvedValueOnce({ id: 'evt_1' });

    const result = await service.processScan('token', 'scan_1', 'ENTRY', 'iphone');

    expect(result.success).toBe(false);
    expect(result.result).toBe('USAGE_LIMIT');
  });

  it('should succeed and increment usage if valid', async () => {
    mockPrisma.qRCode.findUnique.mockResolvedValueOnce({ id: 'qr_1', status: 'ACTIVE', usageLimit: 2, usageCount: 1 });
    mockPrisma.scannerDevice.findUnique.mockResolvedValueOnce({ id: 'scan_1', organizationId: 'org_1' });
    mockPrisma.event.findFirst.mockResolvedValueOnce({ id: 'evt_1' });
    mockPrisma.qRCode.update.mockResolvedValueOnce({ id: 'qr_1', usageCount: 2 });

    const result = await service.processScan('token', 'scan_1', 'ENTRY', 'iphone');

    expect(result.success).toBe(true);
    expect(mockPrisma.qRCode.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'qr_1' },
      data: { usageCount: { increment: 1 } }
    }));
    expect(mockScanLogger.logSuccessScan).toHaveBeenCalled();
    expect(mockEventBus.emit).toHaveBeenCalledWith('checkin.succeeded', expect.any(Object));
  });
});

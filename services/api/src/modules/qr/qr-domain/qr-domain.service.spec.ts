import { Test, TestingModule } from '@nestjs/testing';
import { QrDomainService } from './qr-domain.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENT_BUS } from '../../../common/event-bus/event-bus.interface';
import { QR_PROVIDER } from '../interfaces/qr-provider.interface';

const mockPrisma = {
  qRCode: {
    create: jest.fn(),
    update: jest.fn(),
  }
};

const mockEventBus = {
  emit: jest.fn()
};

const mockQrProvider = {
  generateToken: jest.fn().mockResolvedValue('secure_token_123')
};

describe('QrDomainService', () => {
  let service: QrDomainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrDomainService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EVENT_BUS, useValue: mockEventBus },
        { provide: QR_PROVIDER, useValue: mockQrProvider }
      ],
    }).compile();

    service = module.get<QrDomainService>(QrDomainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a QR Code with UNLIMITED limit if usagePolicy is UNLIMITED', async () => {
    mockPrisma.qRCode.create.mockResolvedValueOnce({ id: 'qr_1' });

    await service.generateQrCode('REGISTRATION', 'ref_1', 'UNLIMITED', 1);

    expect(mockQrProvider.generateToken).toHaveBeenCalled();
    expect(mockPrisma.qRCode.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        type: 'REGISTRATION',
        referenceId: 'ref_1',
        token: 'secure_token_123',
        usagePolicy: 'UNLIMITED',
        usageLimit: 999999,
        status: 'ACTIVE'
      })
    }));
    expect(mockEventBus.emit).toHaveBeenCalledWith('qr.generated', expect.any(Object));
  });

  it('should revoke a QR Code', async () => {
    mockPrisma.qRCode.update.mockResolvedValueOnce({ id: 'qr_1', status: 'REVOKED' });

    const result = await service.revokeQrCode('qr_1');

    expect(result.status).toBe('REVOKED');
    expect(mockPrisma.qRCode.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'qr_1' },
      data: { status: 'REVOKED' }
    }));
    expect(mockEventBus.emit).toHaveBeenCalledWith('qr.revoked', { qrId: 'qr_1' });
  });
});

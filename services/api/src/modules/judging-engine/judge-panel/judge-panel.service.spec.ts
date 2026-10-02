import { Test, TestingModule } from '@nestjs/testing';
import { JudgePanelService } from './judge-panel.service';

describe('JudgePanelService', () => {
  let service: JudgePanelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JudgePanelService],
    }).compile();

    service = module.get<JudgePanelService>(JudgePanelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { JudgingEngineController } from './judging-engine.controller';

describe('JudgingEngineController', () => {
  let controller: JudgingEngineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JudgingEngineController],
    }).compile();

    controller = module.get<JudgingEngineController>(JudgingEngineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

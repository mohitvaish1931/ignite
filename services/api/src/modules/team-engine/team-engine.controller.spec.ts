import { Test, TestingModule } from '@nestjs/testing';
import { TeamEngineController } from './team-engine.controller';

describe('TeamEngineController', () => {
  let controller: TeamEngineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamEngineController],
    }).compile();

    controller = module.get<TeamEngineController>(TeamEngineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

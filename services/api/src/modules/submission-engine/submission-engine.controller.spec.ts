import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionEngineController } from './submission-engine.controller';

describe('SubmissionEngineController', () => {
  let controller: SubmissionEngineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionEngineController],
    }).compile();

    controller = module.get<SubmissionEngineController>(SubmissionEngineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ProblemStatementsService } from './problem-statements.service';

describe('ProblemStatementsService', () => {
  let service: ProblemStatementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemStatementsService],
    }).compile();

    service = module.get<ProblemStatementsService>(ProblemStatementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

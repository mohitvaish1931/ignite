import { Module } from '@nestjs/common';
import { SubmissionDomainService } from './submission-domain/submission-domain.service';
import { SubmissionEngineController } from './submission-engine.controller';

@Module({
  providers: [SubmissionDomainService],
  controllers: [SubmissionEngineController],
  exports: [SubmissionDomainService]
})
export class SubmissionEngineModule {}

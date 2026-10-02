import { Module } from '@nestjs/common';
import { TracksService } from './tracks/tracks.service';
import { ProblemStatementsService } from './problem-statements/problem-statements.service';

@Module({
  providers: [TracksService, ProblemStatementsService]
})
export class HackathonCoreModule {}

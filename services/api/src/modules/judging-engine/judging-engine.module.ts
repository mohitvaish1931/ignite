import { Module } from '@nestjs/common';
import { ScoringDomainService } from './scoring-domain/scoring-domain.service';
import { JudgePanelService } from './judge-panel/judge-panel.service';
import { LeaderboardService } from './leaderboard/leaderboard.service';
import { JudgingEngineController } from './judging-engine.controller';

@Module({
  providers: [ScoringDomainService, JudgePanelService, LeaderboardService],
  controllers: [JudgingEngineController],
  exports: [ScoringDomainService, LeaderboardService]
})
export class JudgingEngineModule {}

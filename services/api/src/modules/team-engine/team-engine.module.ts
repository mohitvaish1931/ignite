import { Module } from '@nestjs/common';
import { TeamDomainService } from './team-domain/team-domain.service';
import { TeamEngineController } from './team-engine.controller';

@Module({
  providers: [TeamDomainService],
  controllers: [TeamEngineController],
  exports: [TeamDomainService]
})
export class TeamEngineModule {}
